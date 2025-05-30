"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authRouter = (0, express_1.Router)();
authRouter.get("/getNonce", (req, res) => {
    (0, authController_1.genNonce)(req, res);
});
authRouter.post("/login", async (req, res) => {
    (0, authController_1.loginUser)(req, res);
});
exports.default = authRouter;
