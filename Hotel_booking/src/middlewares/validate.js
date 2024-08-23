import { check } from "express-validator";
import userType from "../enums/userType.js";
import RoomType from "../models/roomType.js";
import ApiException from "../utils/apiException.js";

var loginValidation = [
    check("username").notEmpty().withMessage("Username cannot be empty").isString().withMessage("Username must be string"),
    check("password").isString().withMessage("Password must be string").notEmpty().withMessage("Password cannot be empty"),
];

var signupValidation = [
    check("username").isString().withMessage("Username must be string").notEmpty().withMessage("Username cannot be empty"),
    check("password").isString().withMessage("Password must be string").notEmpty().withMessage("Password cannot be empty"),
    check("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new ApiException(1019);
        }
        return true;
    }),
    check("email").isEmail().withMessage("Email must be valid").notEmpty().withMessage("Email cannot be empty"),
    check("type")
        .not()
        .isEmpty()
        .withMessage("Type cannot be empty")
        .custom((value) => {
            if (!["OWNER", "GUEST"].includes(value)) {
                throw new Error("Invalid user type");
            }
            return true;
        }),
    check("fullName").isString().withMessage("Full name must be string").notEmpty().withMessage("Full name cannot be empty"),
    check("address").isString().withMessage("Address must be string").notEmpty().withMessage("Address cannot be empty"),
    check("phoneNumber").isLength({ min: 10, max: 11 }).withMessage("Phone number must be 10-11 characters").notEmpty().withMessage("Phone number cannot be empty"),
];

var updateInfo = [
    check("fullName").isString().withMessage("Full name must be string").notEmpty().withMessage("Full name cannot be empty"),
    check("address").isString().withMessage("Address must be string").notEmpty().withMessage("Address cannot be empty"),
    check("phoneNumber").isLength({ min: 10, max: 11 }).withMessage("Phone number must be 10-11 characters").notEmpty().withMessage("Phone number cannot be empty"),
    check("birthday").isString().withMessage("Birthday must be string").notEmpty().withMessage("Birthday cannot be empty"),
    check("email").isEmail().withMessage("Email must be valid").notEmpty().withMessage("Email cannot be empty"),
];

var changePassword = [
    check("oldPassword").isString().withMessage("Old password must be string").notEmpty().withMessage("Old password cannot be empty"),
    check("newPassword").isString().withMessage("New password must be string").notEmpty().withMessage("New password cannot be empty"),
    check("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error("Password and confirm password must be the same");
        }
        return true;
    }),
];

var createNewHotel = [
    check("name").isString().withMessage("Name must be a string."),
    check("address").isString().withMessage("Address must be a string."),
    check("phoneNumber")
        .isString()
        .withMessage("Phone number must be a string.")
        .isLength({
            min: 10,
            max: 11,
        })
        .withMessage("The phone number must be 10-11 characters."),
];

var roomValidation = [
    check("hotelId").isNumeric().withMessage("Hotel_id must be a number"),
    check("name").isString().withMessage("Name must be a string"),
    check("price").isNumeric().withMessage("Price must be a number"),
    check("type")
        .isString()
        .withMessage("Type must be string.")
        .custom(async (value) => {
            const isValid = await RoomType.query().findOne({
                key: value,
            });

            if (!isValid) {
                throw new Error("The type isn't on the list.");
            }

            return true;
        }),
    check("occupancy").isNumeric().withMessage("Occupancy must be a number"),
];

var bookingValidation = [
    check("arrivalDate").isISO8601().withMessage("Arrival date must be a date"),
    check("departureDate")
        .isISO8601()
        .withMessage("Departure date must be a date")
        .custom((value, { req }) => {
            if (value < req.body.arrivalDate) {
                throw new Error("Departure date must be after arrival date");
            }
            return true;
        }),
    check("numAdults").isNumeric().withMessage("Number of adults must be a number"),
    check("numChildren").isNumeric().withMessage("Number of children must be a number"),
    check("rooms")
        .isArray()
        .withMessage("Rooms must be an array")
        .custom(async (value) => {
            for (const room of value) {
                if (!room.type || !room.qty) {
                    throw new Error("Room must have type and quantity");
                }
                const isValid = await RoomType.query().findOne({ key: room.type });
                if (!isValid) {
                    throw new Error("Invalid room type");
                }
            }
            return true;
        }),
    check("services").isArray().withMessage("Services must be an array"),
    check("paymentMethod")
        .isString()
        .withMessage("Payment method must be a string")
        .custom((value) => {
            if (value !== "cash" && value !== "credit_card") {
                throw new Error("Payment method must be either cash or credit_card");
            }
            return true;
        }),
];

var bookingStatus = [check("status").isIn(["PENDING", "CANCELLED", "CONFIRMED", "STAYING", "FINISHED"]).withMessage("Invalid status")];

export { loginValidation, signupValidation, updateInfo, changePassword, createNewHotel, roomValidation, bookingValidation, bookingStatus };
