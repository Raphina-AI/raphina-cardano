"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    email: { type: String, unique: true, sparse: true }, // Sparse unique index
    walletAddress: { type: String, unique: true, sparse: true },
    name: { type: String },
    phone: { type: String },
    weight: { type: String },
    height: { type: String },
    bloodType: { type: String },
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    scansUsed: { type: Number, default: 0 },
    ChatNo: { type: Number, default: 0 },
    profileImage: { type: String },
    // New activity log
    activity: [
        {
            action: {
                type: String,
                enum: ['login', 'logout', 'chat', 'scan', 'delete', 'update', 'deleteScan'],
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ]
});
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
