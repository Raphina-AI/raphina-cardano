import { Router } from "express"
import { deleteDiagnosis, getDiagnosis, getPresignedUrlForThirdPartyFileStorage, storeDiagnosis } from "../controllers/StoreController";

const storeRouter: Router = Router();

storeRouter.post("/getDiagnosis", (req, res) => {
    getDiagnosis(req, res).catch((error) => {
        console.error("Error in getDiagnosis:", error);
        res.status(500).json({ error: "Internal Server Error" });
    });
});

storeRouter.post("/storeDiagnosis", (req, res) => {
    storeDiagnosis(req, res).catch((error) => {
        console.error("Error in storeDiagnosis:", error);
        res.status(500).json({ error: "Internal Server Error" });
    });
});

storeRouter.get("/getPresignedUrlFromThirdPartyService", getPresignedUrlForThirdPartyFileStorage);

storeRouter.post("/deleteDiagnosis", (req, res) => {
    deleteDiagnosis(req, res).catch((error) => {
        console.error("Error in deleteDiagnosis:", error);
        res.status(500).json({ error: "Internal Server Error" });
    });
});

// Build For Update Diagnosis and Filtering If selected to uyo

export {
    storeRouter
}