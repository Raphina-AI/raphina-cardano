import { Router } from "express"
import { getDiagnosis, storeDiagnosis } from "../controllers/StoreController.js";

const storeRouter = new Router();

storeRouter.post("/getDiagnosis", getDiagnosis)
storeRouter.post("/storeDiagnosis", storeDiagnosis)

// Build For Update Diagnosis and Filtering If selected to uyo

export {
    storeRouter
}