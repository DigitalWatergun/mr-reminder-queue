import { consoleLogWithDateTime } from "../logger/logger.js";
import { sendEmailReminder } from "../notifications/mailer/mailer.js";
import { sendTextReminder } from "../notifications/texter/texter.js";
import { changeReminderStatus } from "../controllers/reminderController.js";

const addReminderToQueue = async (reminderQueue, reminder) => {
    consoleLogWithDateTime(
        `Adding to queue. REMINDER: ${reminder.title} - ${reminder.content}`
    );
    const cronSchedule = `${reminder.minutes} ${reminder.hour} ${reminder.day} ${reminder.month} ${reminder.weekday}`;
    const options = {
        repeat: {
            cron: cronSchedule,
            tz: "Etc/UTC",
            limit: reminder.repeat,
        },
        removeOnComplete: false,
    };

    await reminderQueue.add(reminder.title, reminder, options);
    console.log(
        await showAllRemindersInQueue(
            reminderQueue,
            "Queue after adding reminder to queue"
        )
    );
};

const processReminder = (job) => {
    consoleLogWithDateTime(`Processing JobId: ${job.id} - ${job.name}`);
    const reminder = job.data;
    if (reminder.enableEmail) {
        sendEmailReminder(reminder);
    }

    if (reminder.enableSMS) {
        sendTextReminder(reminder);
    }
};

const removeReminderFromQueue = async (reminderQueue, reminder) => {
    const jobs = await reminderQueue.getJobs();
    for (const job of jobs) {
        if (job.data._id === reminder._id) {
            consoleLogWithDateTime(
                `Job ${reminder.title} found. Removing from queue.`
            );
            await job.remove();
        }
    }

    console.log(
        await showAllRemindersInQueue(
            reminderQueue,
            "Queue after removing reminder from queue."
        )
    );
};

const showAllRemindersInQueue = async (reminderQueue, message) => {
    const currentRemindersInQueue = [];
    const jobs = await reminderQueue.getJobs();
    if (jobs.length > 0) {
        for (const job of jobs) {
            const jobInfo = {};
            jobInfo.id = job.id;
            jobInfo.name = job.name;
            jobInfo.status = await job.getState();
            currentRemindersInQueue.push(jobInfo);
        }
    }

    currentRemindersInQueue.push({ message: message });
    return currentRemindersInQueue;
};

const checkJobState = async (reminderQueue, jobId) => {
    const jobIdList = jobId.split(":", 2);
    const jobIdRef = jobIdList.join(":");
    consoleLogWithDateTime(`Checking job state for ${jobIdRef}`);

    const foundJobsWithJobIdRef = [];
    const jobs = await reminderQueue.getJobs();
    if (jobs.length > 0) {
        for (const job of jobs) {
            if (job.id.includes(jobIdRef)) {
                consoleLogWithDateTime(
                    `Found jobs that match ${jobIdRef} - ${job.id}`
                );
                foundJobsWithJobIdRef.push(job);
            }
        }
    }

    const completedJobs = [];
    if (foundJobsWithJobIdRef.length >= 1) {
        for (const job of foundJobsWithJobIdRef) {
            if ((await job.getState()) === "completed") {
                completedJobs.push(job);
            }
        }
    }

    if (completedJobs.length === foundJobsWithJobIdRef.length) {
        consoleLogWithDateTime(
            `All jobs that include ${jobIdRef} have been completed. Removing all jobs with ${jobIdRef} from queue and updating Mongo`
        );
        for (const job of foundJobsWithJobIdRef) {
            consoleLogWithDateTime(
                `Removing job ${job.id}-${job.name} from reminder queue.`
            );
            await changeReminderStatus(job.data, "INACTIVE");
            await job.remove();
        }
    } else {
        consoleLogWithDateTime(
            `Not all jobs with ${jobIdRef} are done. Removing completed jobs from queue.`
        );
        for (const job of completedJobs) {
            consoleLogWithDateTime(
                `Removing job ${job.id}-${job.name} from reminder queue.`
            );
            await job.remove();
        }
    }
};

export {
    addReminderToQueue,
    processReminder,
    removeReminderFromQueue,
    showAllRemindersInQueue,
    checkJobState,
};
