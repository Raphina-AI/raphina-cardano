import { Router } from "express"
import { deleteDiagnosis, getDiagnosis, getPresignedUrlForThirdPartyFileStorage, storeDiagnosis } from "../controllers/StoreController";
import { genNonce, loginUser } from "../controllers/authController";

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

storeRouter.get("/getNonce", (req, res) => {
    genNonce(req, res)
});

storeRouter.post("/login", async (req, res) => {
    loginUser(req, res)
})

export {
    storeRouter
}