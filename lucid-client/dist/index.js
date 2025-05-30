"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const store_1 = require("./router/store");
const db_1 = __importDefault(require("./config/db"));
(0, db_1.default)();
if (!process.env.RAPHINA_AI_PRIVATE_KEY || process.env.RAPHINA_AI_PRIVATE_KEY.trim().length === 0) {
    throw new Error("RAPHINA_AI_PRIVATE_KEY is not set in the environment variables.");
}
if (!process.env.VALIDATOR_ADDRESS || process.env.VALIDATOR_ADDRESS.trim().length === 0) {
    throw new Error("VALIDATOR_ADDRESS is not set in the environment variables.");
}
if (!process.env.RAPHINA_KEY_FOR_ENCRYPTING_DATA || process.env.RAPHINA_KEY_FOR_ENCRYPTING_DATA.trim().length === 0) {
    throw new Error("RAPHINA_KEY_FOR_ENCRYPTING_DATA is not set in the environment variables.");
}
const app = (0, express_1.default)();
app.use(express_1.default.json());
// app.use((req, res, next) => { // Load environment variables from .env file
//     if (!process.env.RAPHINA_AI_PRIVATE_KEY || process.env.RAPHINA_AI_PRIVATE_KEY.trim().length == 0 || !process.env.VALIDATOR_ADDRESS || process.env.VALIDATOR_ADDRESS.trim().length == 0 || !process.env.RAPHINA_KEY_FOR_ENCRYPTING_DATA || process.env.RAPHINA_KEY_FOR_ENCRYPTING_DATA.trim().length == 0) {
//         throw new Error("RAPHINA_AI_PRIVATE_KEY is not set in the environment variables.");
//     }
//     next();
// })
app.use(express_1.default.urlencoded());
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    // allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use("/", store_1.storeRouter);
// app.use(authRouter);
app.listen(3000, () => {
    console.log("App is running");
});
