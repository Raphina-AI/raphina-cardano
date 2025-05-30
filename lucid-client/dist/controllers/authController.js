"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
exports.genNonce = genNonce;
const core_1 = require("@meshsdk/core");
const core_2 = require("@meshsdk/core");
const user_1 = __importDefault(require("../models/user"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function genNonce(req, res) {
    res.status(200).json({ nonce: (0, core_1.generateNonce)("Sign to agree to the terms and conditions of the raphinaAI and login with wallet.") });
}
const loginUser = async (req, res) => {
    const { address: walletAddress, signedMessage, nonce, email } = req.body;
    try {
        let user;
        if (walletAddress && signedMessage) {
            // Normalize the signature
            const result = (0, core_2.checkSignature)(nonce, signedMessage, walletAddress);
            if (!result) {
                return res.status(401).json({ message: 'Invalid signature' });
            }
            // Find or create the user by wallet address
            user = await user_1.default.findOne({ walletAddress });
            if (!user) {
                user = new user_1.default({ walletAddress });
                await user.save();
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.SECRET_KEY);
            res.status(200).json({ token });
        }
        else {
            return res.status(400).json({ message: 'No wallet address or email provided' });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
exports.loginUser = loginUser;
