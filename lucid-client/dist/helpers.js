"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minLoveLaceForDiagnosisDatum = exports.provider = void 0;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.createDiagnosisDatum = createDiagnosisDatum;
exports.decodeDiagnosisDatum = decodeDiagnosisDatum;
exports.getPinataSDK = getPinataSDK;
const lucid_1 = require("@lucid-evolution/lucid");
const node_crypto_1 = require("node:crypto");
const node_util_1 = require("node:util");
const aiken_types_1 = require("./aiken_types");
const pinata_1 = require("pinata");
const scryptAsync = (0, node_util_1.promisify)(node_crypto_1.scrypt);
const provider = function () {
    return new lucid_1.Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", process.env.BLOCKFROST_PROJECT_ID);
};
exports.provider = provider;
async function encrypt(data, password) {
    try {
        const salt = (0, node_crypto_1.randomBytes)(32);
        const iv = (0, node_crypto_1.randomBytes)(16);
        let encryptionKey = await generateEncryptionKey(password, salt);
        let cipher = (0, node_crypto_1.createCipheriv)('aes-256-gcm', encryptionKey, iv);
        let encrypted = cipher.update(JSON.stringify(data), 'utf-8', 'hex');
        encrypted += cipher.final('hex');
        // Get authentication tag
        const authTag = cipher.getAuthTag();
        password = "";
        encryptionKey = new Buffer("", 'utf-8'); // Clear the encryption key from memory
        return `${salt.toString('hex')}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }
    catch (error) {
        throw new Error("Encryption failed: Something went wrong while encrypting the data.");
    }
}
;
async function decrypt(encryptedCluster, password) {
    try {
        const [salt, iv, authTag, encrypted] = encryptedCluster.split(':').map((str) => Buffer.from(str, 'hex'));
        let encryptionKey = await generateEncryptionKey(password, salt);
        const decipher = (0, node_crypto_1.createDecipheriv)('aes-256-gcm', encryptionKey, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        encryptionKey = new Buffer("", 'utf-8'); // Clear the encryption key from memory
        password = "";
        return JSON.parse(decrypted);
    }
    catch (error) {
        throw new Error("Decryption failed: Invalid password or corrupted data.");
    }
}
async function createDiagnosisDatum(owner, scanImgUrl, diagnosis, timestamp, model) {
    let datum = "";
    const diagnosisBytes = typeof diagnosis === 'string'
        ? Buffer.from(diagnosis).toString('hex')
        : diagnosis;
    const scanImgUrlBytes = typeof scanImgUrl === 'string'
        ? Buffer.from(scanImgUrl).toString('hex')
        : scanImgUrl;
    const modelBytes = typeof model === 'string'
        ? Buffer.from(model).toString('hex')
        : model;
    const userId = typeof owner === 'string'
        ? Buffer.from(owner).toString('hex')
        : owner;
    // Create the diagnosis record object
    const diagnosisRecord = {
        owner: userId,
        scanImg: scanImgUrlBytes,
        diagnosis: diagnosisBytes,
        timestamp: BigInt(timestamp),
        model: modelBytes
    };
    // Convert to CBOR datum
    datum = lucid_1.Data.to(diagnosisRecord, aiken_types_1.DiagnosisDatumDataType2);
    return datum;
}
// Function to decode a datum from CBOR format
function decodeDiagnosisDatum(datumCbor) {
    try {
        // Parse the CBOR datum to our DiagnosisRecord structure
        const diagnosisRecord = lucid_1.Data.from(datumCbor, aiken_types_1.DiagnosisDatumDataType2);
        return {
            owner: Buffer.from(diagnosisRecord.owner, 'hex').toString('utf-8'),
            scanImg: Buffer.from(diagnosisRecord.scanImg, 'hex').toString('utf-8'),
            diagnosis: Buffer.from(diagnosisRecord.diagnosis, 'hex').toString('utf-8'),
            timestamp: Number(diagnosisRecord.timestamp),
            model: Buffer.from(diagnosisRecord.model, 'hex').toString('utf-8')
        };
    }
    catch (error) {
        console.log(error);
        return null;
    }
}
async function generateEncryptionKey(keyroot, salt) {
    // Using scrypt to derive a secure key from the password
    // N=32768: CPU/memory cost parameter
    // r=8: blocksize parameter
    // p=1: parallelization parameter
    // keylen=32: desired key length
    return await scryptAsync(keyroot, salt, 32);
}
;
exports.minLoveLaceForDiagnosisDatum = 500000n; // 0.5 ADA
function getPinataSDK() {
    return new pinata_1.PinataSDK({
        pinataJwt: process.env.PINATA_JWT,
        pinataGateway: process.env.PINATA_GATEWAY,
    });
}
