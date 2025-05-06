import express from "express"
import { storeRouter } from "./router/store.js";
import { config } from "dotenv";
import path from "path";

config({ path: './.env' });

const app = express();

app.use(express.json())
app.use(express.urlencoded())

app.use(storeRouter)

app.listen(3000, () => {
    console.log("App is running");
})