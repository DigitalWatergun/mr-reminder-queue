import { Reminder } from "../models/reminder.js";

const updateReminder = async (data) => {
    const filter = {
        _id: data._id,
    };
    const reminder = await Reminder.findOneAndUpdate(filter, data);

    return reminder;
};

export { updateReminder };
