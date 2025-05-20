import { generatePrivateKey, Lucid } from "lucid-cardano"
import { createDiagnosisDatum, decodeDiagnosisDatum, decrypt, encrypt, minLoveLaceForDiagnosisDatum, provider } from "../helpers.js";

export const getDiagnosis = async (req, res) => {
    try {
        const { password, userId } = req.body;

        if (!password || !userId || password.trim().length == 0 || userId.toString().trim().length == 0) {
            res.json("Unable to return diagnosis, password required to access personalized Info")
        }

        const lucid = await Lucid.new(provider());

        // Using offical wallet to handle all transaction therefore acting as  relayer and bearing the gas
        lucid.selectWalletFromPrivateKey(process.env.RAPHINA_AI_PRIVATE_KEY)

        const utxos = await lucid.utxosAt(process.env.VALIDATOR_ADDRESS) // To Do: Get Validator Script address

        const diagnosis = [];
        for (let i = 0; i < utxos.length; i++) {
            const datum = utxos[i].datum;

            if (!datum) continue;

            const decoded = decodeDiagnosisDatum(datum)

            if (!decoded && decoded.owner != parseInt(userId)) continue;

            let decryptedDiagnosis = await decrypt(decoded.diagnosis, password);

            decoded.diagnosis = decryptedDiagnosis;

            diagnosis.push(decoded);
        }

        res.status(200).json({
            status: 200,
            message: "Diagnosis Retrieved",
            diagnosis: diagnosis,
        })
    } catch (error) {
        if (error.message.includes("Decryption failed: Invalid password or corrupted data.")) {
            res.status(500).json({
                status: 500,
                message: "Decryption failed: Invalid password or corrupted data.",
            })
        } else {
            res.status(500).json({
                status: 500,
                message: "Unable to retrieve diagnosis",
            })
        }
        console.log(error)
    }
}

export async function storeDiagnosis(req, res) {
    try {
        const { userId, password, diagnosis, model } = req.body;

        if (!password || !userId || password.trim().length == 0 || userId.toString().trim().length == 0) {
            res.json("Unable to return diagnosis, password required to access personalized Info")
        }

        const lucid = await Lucid.new(provider(), "Preprod");
        lucid.selectWalletFromPrivateKey(process.env.RAPHINA_AI_PRIVATE_KEY)

        const encryptedDiagnosis = await encrypt(diagnosis, password);

        if ((await getBalance(lucid)) < Number(minLoveLaceForDiagnosisDatum)) {
            res.status(500).json({
                status: 500,
                message: "Insufficient funds to store diagnosis",
            })
            return;
        }

        const tx = lucid.newTx().payToContract(
            process.env.VALIDATOR_ADDRESS,
            {
                inline: await createDiagnosisDatum(
                    lucid,
                    userId,
                    encryptedDiagnosis,
                    Date.now(),
                    model
                )
            },
            { lovelace: 200000n }
        )
            .complete(); // To Do: Get Validator Script address

        const signedTx = await (await tx).sign().complete();
        const hash = await signedTx.submit();

        res.status(200).json({
            status: 200,
            message: "Diagnosis Stored",
            txHash: hash,
        })
    } catch (error) {
        if (error.message.includes("Encryption failed: Something went wrong while encrypting the data.")) {
            res.status(500).json({
                status: 500,
                message: "Encryption failed: Something went wrong while encrypting the data.",
            })
        } else {
            res.status(500).json({
                status: 500,
                message: "Unable to store diagnosis",
            })
        }
        console.log(error)
    }
}


async function getBalance(lucid) {
    const utxos = await lucid.wallet.getUtxos();
    const balance = utxos.reduce((acc, utxo) => acc + utxo.assets.lovelace, 0n);
    return Number(balance);
}

async function createWallet(lucid) {
    const privateKey = generatePrivateKey()
    const wallet = lucid.selectWalletFromPrivateKey(privateKey)

    const address = await wallet.wallet.address()
    console.log(`Address: ${address}`, `Private Key: ${privateKey}`);

    return wallet
}
