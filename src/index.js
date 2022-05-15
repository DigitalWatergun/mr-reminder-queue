import Queue from "bull";
import { PubSub } from "@google-cloud/pubsub";
import mongoose from "mongoose";
import cron from "cron";
import { redisConfig } from "./reminderQueue/reminderQueueConfig.js";
import { consoleLogWithDateTime } from "./logger/logger.js";
import {
    addReminderToQueue,
    processReminder,
    removeReminderFromQueue,
    showAllRemindersInQueue,
    checkJobState,
} from "./reminderQueue/reminderQueue.js";
import dotenv from "dotenv";
dotenv.config();

const main = async () => {
    consoleLogWithDateTime("Connecting to Reminder Queue...");
    const reminderQueue = new Queue("reminders", { redis: redisConfig });

    consoleLogWithDateTime("Connecting to MongoDB...");
    mongoose.connect(process.env.MONGO_URI);

    consoleLogWithDateTime("Creating PubSub Client...");
    const pubSubClient = new PubSub({ projectId: process.env.GCP_PROJECT_ID });

    consoleLogWithDateTime("Connecting to PubSub Subscription...");
    const subscription = pubSubClient.subscription(
        process.env.GCP_PUBSUB_SUBSCRIPTION_ID
    );

    consoleLogWithDateTime("Current Job Queue:");
    console.log(
        await showAllRemindersInQueue(reminderQueue, "Deployment startup")
    );

    mongoose.connection.on("error", (err) => {
        consoleLogWithDateTime(err.message);
    });
    mongoose.connection.on("connected", () => {
        consoleLogWithDateTime("Connected to MongoDB.");
    });

    const messageHandler = (message) => {
        message.ack();
        const dataString = Buffer.from(message.data, "base64").toString();
        const reminder = JSON.parse(dataString);
        const attributes = message.attributes;
        consoleLogWithDateTime(
            `Received message ${message.id} for ${reminder.title} with the event ${attributes.eventType}`
        );

        if (attributes.eventType === "RUN") {
            addReminderToQueue(reminderQueue, reminder);
        }

        if (attributes.eventType === "STOP") {
            removeReminderFromQueue(reminderQueue, reminder);
        }
    };

    subscription.on("message", messageHandler);

    reminderQueue.process("*", async (job, done) => {
        processReminder(job);
        done();
    });

    reminderQueue.on("global:completed", async (jobId) => {
        consoleLogWithDateTime(`${jobId} completed.`);
        console.log(
            await showAllRemindersInQueue(
                reminderQueue,
                "Queue after completed"
            )
        );
        await checkJobState(reminderQueue, jobId);
    });

    const job = new cron.CronJob(
        "*/30 * * * *",
        async () => {
            consoleLogWithDateTime(
                "Listening for messages. Current Job Queue: "
            );
            console.log(
                await showAllRemindersInQueue(
                    reminderQueue,
                    "Current Job Queue"
                )
            );
        },
        null,
        true,
        "Etc/UTC"
    );
    job.start();
};

main();
