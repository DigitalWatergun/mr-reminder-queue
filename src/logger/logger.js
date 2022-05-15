import { generateDateTime } from "../timestamp/generateDateTime.js";

const consoleLogWithDateTime = (message) => {
    const timestamp = generateDateTime();
    console.log(`[${timestamp}] ${message}`);
};

export { consoleLogWithDateTime };
