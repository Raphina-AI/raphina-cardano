import { generateNonce } from "@meshsdk/core";
import { Request, Response } from "express";
import { checkSignature } from "@meshsdk/core";
import User from "../models/user"
import jwt from "jsonwebtoken";

export function genNonce(req: Request, res: Response) {
    res.status(200).json({ nonce: generateNonce("Sign to agree to the terms and conditions of the raphinaAI and login with wallet.") });
}

export const loginUser = async (req: Request, res: Response) => {
    const { address: walletAddress, signedMessage, nonce, email } = req.body;

    try {
        let user;

        if (walletAddress && signedMessage) {
            // Normalize the signature
            const result = checkSignature(nonce, signedMessage, walletAddress);
            if (!result) {
                return res.status(401).json({ message: 'Invalid signature' });
            }

            // Find or create the user by wallet address
            user = await User.findOne({ walletAddress });
            if (!user) {
                user = new User({ walletAddress });
                await user.save();
            }

            // Generate JWT token
            const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY!);

            res.status(200).json({ token });
        } else {
            return res.status(400).json({ message: 'No wallet address or email provided' });
        }
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
