import dotenv from 'dotenv';
dotenv.config();

import express from "express"
import cors from "cors";
import { storeRouter } from "./router/store";
import connectDB from './config/db';
import authRouter from './router/auth';

connectDB();

if (!process.env.RAPHINA_AI_PRIVATE_KEY || process.env.RAPHINA_AI_PRIVATE_KEY.trim().length === 0) {
    throw new Error("RAPHINA_AI_PRIVATE_KEY is not set in the environment variables.");
}
if (!process.env.VALIDATOR_ADDRESS || process.env.VALIDATOR_ADDRESS.trim().length === 0) {
    throw new Error("VALIDATOR_ADDRESS is not set in the environment variables.");
}
if (!process.env.RAPHINA_KEY_FOR_ENCRYPTING_DATA || process.env.RAPHINA_KEY_FOR_ENCRYPTING_DATA.trim().length === 0) {
    throw new Error("RAPHINA_KEY_FOR_ENCRYPTING_DATA is not set in the environment variables.");
}

const app = express();

app.use(express.json())
// app.use((req, res, next) => { // Load environment variables from .env file
//     if (!process.env.RAPHINA_AI_PRIVATE_KEY || process.env.RAPHINA_AI_PRIVATE_KEY.trim().length == 0 || !process.env.VALIDATOR_ADDRESS || process.env.VALIDATOR_ADDRESS.trim().length == 0 || !process.env.RAPHINA_KEY_FOR_ENCRYPTING_DATA || process.env.RAPHINA_KEY_FOR_ENCRYPTING_DATA.trim().length == 0) {
//         throw new Error("RAPHINA_AI_PRIVATE_KEY is not set in the environment variables.");
//     }

//     next();
// })
app.use(express.urlencoded())
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    // allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(storeRouter)
app.use("/auth", authRouter);

app.listen(3000, () => {
    console.log("App is running");
})