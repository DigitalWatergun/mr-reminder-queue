import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { google } from "googleapis";
dotenv.config();

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
    const oauth2Client = new OAuth2(
        process.env.MAILER_CLIENT_ID,
        process.env.MAILER_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.MAILER_REFRESH_TOKEN,
    });

    const accessToken = oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.MAILER_EMAIL,
            accessToken: accessToken,
            clientId: process.env.MAILER_CLIENT_ID,
            clientSecret: process.env.MAILER_CLIENT_SECRET,
            refreshToken: process.env.MAILER_REFRESH_TOKEN,
        },
    });

    return transporter;
};

const sendEmailReminder = async (reminder) => {
    const emailOptions = {
        subject: `REMINDER: ${reminder.title}`,
        text: `REMINDER FROM REMINDER APP\n${reminder.content}`,
        to: reminder.email,
        bcc: process.env.MAILER_EMAIL,
    };

    let transporter = await createTransporter();
    await transporter.sendMail(emailOptions);
};

export { sendEmailReminder };
