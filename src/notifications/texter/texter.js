import { consoleLogWithDateTime } from "../../logger/logger.js";
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

const sendTextReminder = async (reminder) => {
    try {
        const result = await client.messages.create({
            body: `REMINDER: ${reminder.title} - ${reminder.content}`,
            from: process.env.TWILIO_NUMBER,
            to: reminder.mobile,
        });
        consoleLogWithDateTime(result.body);
    } catch (error) {
        consoleLogWithDateTime(error.message);
    }
};

export { sendTextReminder };
