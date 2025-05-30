import mongoose, { Schema } from 'mongoose';

const userSchema: Schema = new mongoose.Schema({
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

const User = mongoose.model('User', userSchema);

export default User;