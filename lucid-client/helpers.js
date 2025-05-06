import { Blockfrost, Data } from 'lucid-cardano';
import { randomBytes, createCipheriv, createDecipheriv, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { DiagnosisDatumDataType } from './aiken_types.js';

const scryptAsync = promisify(scrypt);

export const provider = function () {
  return new Blockfrost(
    "https://cardano-preprod.blockfrost.io/api/v0",
    process.env.BLOCKFROST_PROJECT_ID,
  );
}

export async function encrypt(data, password) {
  try {
    const salt = randomBytes(32);
    const iv = randomBytes(16);

    let encryptionKey = await generateEncryptionKey(password, salt);

    let cipher = createCipheriv('aes-256-gcm', encryptionKey, iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf-8', 'hex')
    encrypted += cipher.final('hex')

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    password = undefined;
    encryptionKey = undefined;

    return `${salt.toString('hex')}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    throw new Error("Encryption failed: Something went wrong while encrypting the data.");
  }
};

export async function decrypt(encryptedCluster, password) {
  try {
    const [salt, iv, authTag, encrypted] = encryptedCluster.split(':').map(str => Buffer.from(str, 'hex'));

    let encryptionKey = await generateEncryptionKey(password, salt);

    const decipher = createDecipheriv('aes-256-gcm', encryptionKey, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    encryptionKey = undefined;
    password = "";

    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error("Decryption failed: Invalid password or corrupted data.");
  }
}

export async function createDiagnosisDatum(lucid, owner, diagnosis, timestamp, model) {
  // Convert string to bytes if needed
  const diagnosisBytes = typeof diagnosis === 'string'
    ? Buffer.from(diagnosis).toString('hex')
    : diagnosis;

  const modelBytes = typeof model === 'string'
    ? Buffer.from(model).toString('hex')
    : model;

  // Create the diagnosis record object
  const diagnosisRecord = {
    owner: BigInt(owner),
    diagnosis: diagnosisBytes,
    timestamp: BigInt(timestamp),
    model: modelBytes
  };

  // Convert to CBOR datum
  const datum = Data.to(diagnosisRecord, DiagnosisDatumDataType);

  return datum
}

// Function to decode a datum from CBOR format
export function decodeDiagnosisDatum(datumCbor) {
  // Parse the CBOR datum to our DiagnosisRecord structure
  const diagnosisRecord = Data.from(datumCbor, DiagnosisDatumDataType);

  // Convert bytes back to readable strings for display purposes
  return {
    owner: Number(diagnosisRecord.owner), // Convert BigInt to Number if in range
    diagnosis: Buffer.from(diagnosisRecord.diagnosis, 'hex').toString('utf-8'),
    timestamp: Number(diagnosisRecord.timestamp),
    model: Buffer.from(diagnosisRecord.model, 'hex').toString('utf-8')
  };
}

async function generateEncryptionKey(keyroot, salt) {
  // Using scrypt to derive a secure key from the password
  // N=32768: CPU/memory cost parameter
  // r=8: blocksize parameter
  // p=1: parallelization parameter
  // keylen=32: desired key length
  return await scryptAsync(
    keyroot,
    salt,
    32, // keylen: 32 bytes for AES-256
  );
};

export const minLoveLaceForDiagnosisDatum = 200000n; // 0.2 ADA