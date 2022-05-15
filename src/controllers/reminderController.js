import { updateReminder } from "../services/reminderService.js";

const changeReminderStatus = async (reminder, status) => {
    const data = reminder;
    data["status"] = status;
    const result = await updateReminder(data);

    if (result) {
        return `Updated ${reminder.title} status to ${status}.`;
    } else {
        return "Failed to change reminder status.";
    }
};

export { changeReminderStatus };
