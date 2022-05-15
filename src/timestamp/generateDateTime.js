const generateDateTime = () => {
    const dateObject = new Date();

    let [year, month, day, hour, minute] = [
        dateObject.getUTCFullYear(),
        dateObject.getUTCMonth() + 1,
        dateObject.getUTCDate(),
        dateObject.getUTCHours(),
        dateObject.getUTCMinutes(),
    ];

    if (month < 10) {
        month = `0${month}`;
    }

    if (day < 10) {
        day = `0${day}`;
    }

    if (hour < 10) {
        hour = `0${hour}`;
    }

    if (minute < 10) {
        minute = `0${minute}`;
    }

    const timestamp = `${year}-${month}-${day} ${hour}:${minute} UTC`;

    return timestamp;
};

export { generateDateTime };
