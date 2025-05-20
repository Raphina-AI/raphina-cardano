import express from "express"
import cors from "cors";
import { storeRouter } from "./router/store.js";
import { config } from "dotenv";
import path from "path";

config({ path: './.env' });

const app = express();

app.use(express.json())
app.use(express.urlencoded())
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    // allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(storeRouter)

app.listen(3000, () => {
    console.log("App is running");
})