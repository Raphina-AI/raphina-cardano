import { Blockfrost, Data, Datum, LucidEvolution } from "@lucid-evolution/lucid";
import { randomBytes, createCipheriv, createDecipheriv, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { DiagnosisDatumDataType, DiagnosisDatumDataType2 } from './aiken_types';
import { PinataSDK } from 'pinata';
import { checkSignature, generateNonce } from "@meshsdk/core";

const scryptAsync = promisify(scrypt);

export const provider = function () {
  return new Blockfrost(
    "https://cardano-preprod.blockfrost.io/api/v0",
    process.env.BLOCKFROST_PROJECT_ID,
  );
}

export async function encrypt(data: string, password: string) {
  try {
    const salt = randomBytes(32);
    const iv = randomBytes(16);

    let encryptionKey = await generateEncryptionKey(password, salt) as Buffer<ArrayBuffer>;

    let cipher = createCipheriv('aes-256-gcm', encryptionKey, iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf-8', 'hex')
    encrypted += cipher.final('hex')

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    password = "";
    encryptionKey = new Buffer("", 'utf-8'); // Clear the encryption key from memory

    return `${salt.toString('hex')}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    throw new Error("Encryption failed: Something went wrong while encrypting the data.");
  }
};

export async function decrypt(encryptedCluster: string, password: string) {
  try {
    const [salt, iv, authTag, encrypted] = encryptedCluster.split(':').map((str: string) => Buffer.from(str, 'hex'));

    let encryptionKey = await generateEncryptionKey(password, salt) as Buffer<ArrayBuffer>;

    const decipher = createDecipheriv('aes-256-gcm', encryptionKey, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    encryptionKey = new Buffer("", 'utf-8'); // Clear the encryption key from memory
    password = "";

    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error("Decryption failed: Invalid password or corrupted data.");
  }
}

export async function createDiagnosisDatum(owner: string, scanImgUrl: string, diagnosis: string, timestamp: number, model: string) {
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
  datum = Data.to(diagnosisRecord as any, DiagnosisDatumDataType2);

  return datum
}

// Function to decode a datum from CBOR format
export function decodeDiagnosisDatum(datumCbor: Datum) {
  try {
    // Parse the CBOR datum to our DiagnosisRecord structure
    const diagnosisRecord = Data.from(datumCbor, DiagnosisDatumDataType2);

    return {
      owner: Buffer.from(diagnosisRecord.owner, 'hex').toString('utf-8'),
      scanImg: Buffer.from(diagnosisRecord.scanImg, 'hex').toString('utf-8'),
      diagnosis: Buffer.from(diagnosisRecord.diagnosis, 'hex').toString('utf-8'),
      timestamp: Number(diagnosisRecord.timestamp),
      model: Buffer.from(diagnosisRecord.model, 'hex').toString('utf-8')
    }
  } catch (error) {
    console.log(error);

    return null
  }
}

async function generateEncryptionKey(keyroot: string, salt: Buffer<ArrayBuffer>) {
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

export const minLoveLaceForDiagnosisDatum = 500000n; // 0.5 ADA

export function getPinataSDK() {
  return new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY,
  });
}

export function mintDiagnosisReward(lucid: LucidEvolution) {
  lucid.newTx().mintAssets()
}
