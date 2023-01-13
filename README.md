# mr-reminder-queue

Codebase for Mr Reminder Job Queue

### Architecture Diagram

![arch_diagram](https://github.com/DigitalWatergun/mr-reminder-queue/blob/main/diagram/MrReminder_Architecture_Diagram.png)

The service that handles all the reminders and adds them to a job queue. 
Uses Google PubSub to receive the reminder start/stop. Then talks to MongoDB to fetch the reminder details. 
Bull Redis is used under the hood to maintain the queue.
Emails are sent with Nodemailer and SMS texts are sent with Twilio.
