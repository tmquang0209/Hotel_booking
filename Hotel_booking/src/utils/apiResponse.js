import { messages } from "../enums/messages.js";

const apiResponse = (code, success, data) => {
    // get message from code
    const messageResponse = messages[code];
    return {
        success: success,
        message: messageResponse,
        data: data,
    };
};

export { apiResponse };
