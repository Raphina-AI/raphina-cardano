"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeRouter = void 0;
const express_1 = require("express");
const StoreController_1 = require("../controllers/StoreController");
const authController_1 = require("../controllers/authController");
const storeRouter = (0, express_1.Router)();
exports.storeRouter = storeRouter;
storeRouter.post("/getDiagnosis", (req, res) => {
    (0, StoreController_1.getDiagnosis)(req, res).catch((error) => {
        console.error("Error in getDiagnosis:", error);
        res.status(500).json({ error: "Internal Server Error" });
    });
});
storeRouter.post("/storeDiagnosis", (req, res) => {
    (0, StoreController_1.storeDiagnosis)(req, res).catch((error) => {
        console.error("Error in storeDiagnosis:", error);
        res.status(500).json({ error: "Internal Server Error" });
    });
});
storeRouter.get("/getPresignedUrlFromThirdPartyService", StoreController_1.getPresignedUrlForThirdPartyFileStorage);
storeRouter.post("/deleteDiagnosis", (req, res) => {
    (0, StoreController_1.deleteDiagnosis)(req, res).catch((error) => {
        console.error("Error in deleteDiagnosis:", error);
        res.status(500).json({ error: "Internal Server Error" });
    });
});
storeRouter.get("/getNonce", authController_1.genNonce);
storeRouter.post("/login", async (req, res) => {
    (0, authController_1.loginUser)(req, res).catch((error) => {
        console.error("Error in loginUser:", error);
        res.status(500).json({ error: "Internal Server Error" });
    });
});
