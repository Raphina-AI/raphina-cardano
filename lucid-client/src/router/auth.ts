import { Request, Response, Router } from "express";
import { genNonce, loginUser } from "../controllers/authController";

const authRouter = Router();

authRouter.get("/getNonce", (req, res) => {
    genNonce(req, res)
});

authRouter.post("/login", async (req: Request, res: Response) => {
    loginUser(req, res)
})

export default authRouter;



