import { Data, generatePrivateKey, Lucid } from "@lucid-evolution/lucid"
import { createDiagnosisDatum, decodeDiagnosisDatum, decrypt, encrypt, getPinataSDK, minLoveLaceForDiagnosisDatum, provider } from "../helpers.js";
import { DiagnosisDatumDataType2, RedeemerDataType } from "../aiken_types.js";

export const getDiagnosis = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId || userId.trim().length == 0) {
            return res.status(400).json({
                status: 400,
                message: "Unable to return diagnosis, password required to access personalized Info"
            })
        }

        const lucid = await Lucid(provider(), "Preprod");

        // Using offical wallet to handle all transaction therefore acting as  relayer and bearing the gas
        lucid.selectWallet.fromPrivateKey(process.env.RAPHINA_AI_PRIVATE_KEY)

        const utxos = await lucid.utxosAt(process.env.VALIDATOR_ADDRESS) // To Do: Get Validator Script address

        const diagnosis = [];

        // diagnosis.push(decodeDiagnosisDatum("d8799f015f58406565646136336463643362333536373232656561363061323532313365353330383663366235643064396461306665666666646363396536376362366531326658403a63313330636163643337373238353937353538303564653735643337393935313a653864663131393764623135643134363430303662313039626664656162583f33343a393033656339333239363664633335343033383464623861353163633662663362313463333536653334356537653933346230656233636363313262ff5f58403432353839336438316366353466383764656335346634373062333839626438323434366565653364646433393764336133656461313034383230366136613658403a30303062306234386264346431626437663561636562633561376464663831313a323632326534346366303731663633363666346266373864396565633532582f34633a3833666532653133396334623836373733626632346238393135356430316166346461353763333566316435ff1b00000196ea567cbc427633ff"));
        for (let i = 0; i < utxos.length; i++) {
            const datum = utxos[i].datum;

            if (!datum) continue;

            const decoded = decodeDiagnosisDatum(datum)

            if (!decoded || (decoded.owner.toString() != userId)) continue;

            let decryptedDiagnosis = await decrypt(decoded.diagnosis, process.env.RAPHINA_KEY_FOR_ENCRYPTING_DATA);
            let decryptedScanImgUrl = await decrypt(decoded.scanImg, process.env.RAPHINA_KEY_FOR_ENCRYPTING_DATA);

            // fetch the img from the url and then convert to bytes and return to frontend

            decoded.diagnosis = decryptedDiagnosis;
            decoded.scanImg = decryptedScanImgUrl;

            diagnosis.push(decoded);
        }

        res.status(200).json({
            status: 200,
            message: "Diagnosis Retrieved",
            diagnosis,
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
                message: error.message,
            })
        }
        console.log(error)
    }
}

export const getFilteredDiagnosis = async (req, res) => {
    try {
        const { userId, searchKey } = req.body;

        if (!userId || userId.trim().length == 0) {
            return res.status(400).json({
                status: 400,
                message: "Unable to return diagnosis, user not specified"
            })
        }

        const lucid = await Lucid(provider(), "Preprod");

        // Using offical wallet to handle all transaction therefore acting as  relayer and bearing the gas
        lucid.selectWallet.fromPrivateKey(process.env.RAPHINA_AI_PRIVATE_KEY)

        const utxos = await lucid.utxosAt(process.env.VALIDATOR_ADDRESS) // To Do: Get Validator Script address

        const diagnosis = [];
        for (let i = 0; i < utxos.length; i++) {
            const datum = utxos[i].datum;

            if (!datum) continue;

            const decoded = decodeDiagnosisDatum(datum)

            if (decoded.owner != parseInt(userId)) continue;

            let decryptedDiagnosis = await decrypt(decoded.diagnosis, process.env.RAPHINA_KEY_FOR_ENCRYPTING_DATA);
            let decryptedScanImgUrl = await decrypt(decoded.scanImg, process.env.RAPHINA_KEY_FOR_ENCRYPTING_DATA);

            // fetch the img from the url and then convert to bytes and return to frontend

            decoded.diagnosis = decryptedDiagnosis;
            // filter the diagnosis

            decoded.scanImg = decryptedScanImgUrl;

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

export const getPresignedUrlForThirdPartyFileStorage = async (req, res) => {
    try {
        const pinata = getPinataSDK();
        const url = await pinata.upload.public.createSignedURL({
            expires: 300
        });

        res.status(200).json({
            status: 200,
            url
        })
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Something went wrong, unable to get presigned url"
        })
    };
}

export async function storeDiagnosis(req, res) {
    try {
        const { userId, scan, diagnosis, model } = req.body;

        if (!userId || userId.trim().length == 0) {
            return res.status(400).json({
                status: 400,
                message: "Unable to store diagnosis, no user stated"
            })
        }

        const lucid = await Lucid(provider(), "Preprod");
        lucid.selectWallet.fromPrivateKey(process.env.RAPHINA_AI_PRIVATE_KEY)

        const encryptedDiagnosis = await encrypt(diagnosis, process.env.RAPHINA_KEY_FOR_ENCRYPTING_DATA);

        const encryptedScanImgUrl = await encrypt(scan, process.env.RAPHINA_KEY_FOR_ENCRYPTING_DATA);

        if ((await getBalance(lucid)) < (Number(minLoveLaceForDiagnosisDatum) + 1000)) {
            res.status(500).json({
                status: 500,
                message: "Insufficient funds to store diagnosis",
            })
            return;
        }

        const diagnosisDatum = await createDiagnosisDatum(
            userId,
            encryptedScanImgUrl,
            encryptedDiagnosis,
            Date.now(),
            model
        )

        console.log(diagnosisDatum);

        const tx = lucid.newTx().pay.ToContract(
            process.env.VALIDATOR_ADDRESS,
            {
                kind: "inline",
                value: diagnosisDatum,
            },
            { lovelace: minLoveLaceForDiagnosisDatum }
        )
            .complete(); // To Do: Get Validator Script address

        const signedTx = await (await tx).sign.withWallet().complete();
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
                message: error.message,
            })
        }
        console.log(error)
    }
}

export async function deleteDiagnosis(req, res) {
    const { userId, cid } = req.body;

    if (!userId || !cid || userId.trim().length == 0 || cid.toString().trim().length == 0) {
        return res.status(400).json({
            status: 400,
            message: "Unable to update Diagnosis, non selected"
        })
    }

    const lucid = await Lucid(provider(), "Preprod");

    // Using offical wallet to handle all transaction therefore acting as  relayer and bearing the gas
    lucid.selectWallet.fromPrivateKey(process.env.RAPHINA_AI_PRIVATE_KEY)

    if ((await getBalance(lucid)) < (Number(minLoveLaceForDiagnosisDatum) + 1000)) {
        res.status(500).json({
            status: 500,
            message: "Insufficient funds to store diagnosis",
        })
        return;
    }

    const utxos = await lucid.utxosAt(process.env.VALIDATOR_ADDRESS);

    let utxo;
    let diagnosisDatum;

    for (let i = 0; i < utxos.length; i++) {
        const datum = utxos[i].datum;

        if (!datum) continue;

        const decoded = decodeDiagnosisDatum(datum)

        console.log(await decrypt(decoded.scanImg, process.env.RAPHINA_KEY_FOR_ENCRYPTING_DATA));
        if ((decoded.owner == parseInt(userId)) && (await decrypt(decoded.scanImg, process.env.RAPHINA_KEY_FOR_ENCRYPTING_DATA) == cid)) {
            utxo = utxos[i];
            diagnosisDatum = decoded;
            break;
        };
    }

    if (!utxo) {
        return res.status(404).json({
            status: 404,
            message: "Diagnosis not found",
        });
    }

    const redeemer = Data.to({
        owner: Buffer.from(userId).toString('hex'),
        action: Buffer.from("UPDATE DIAGNOSIS").toString('hex'),
    }, RedeemerDataType);

    const oldTx = await lucid
        .newTx()
        .collectFrom([utxo], redeemer)
        .attach
        .SpendingValidator({
            type: "PlutusV3",
            script: process.env.VALIDATOR_COMPILED, // To Do: Get Validator Script address
        }) // To Do: Get Validator Script address
        .complete();


    const spendTxHash = await (await oldTx.sign.withWallet().complete()).submit();

    diagnosisDatum.owner = "0"; // Set to company data

    console.log(diagnosisDatum);

    const datum = await createDiagnosisDatum(diagnosisDatum.owner, diagnosisDatum.scanImg, diagnosisDatum.diagnosis, diagnosisDatum.timestamp, diagnosisDatum.model);

    console.log(datum);

    const tx = lucid.newTx().pay.ToContract(
        process.env.VALIDATOR_ADDRESS,
        {
            kind: "inline",
            value: datum,
        },
        { lovelace: minLoveLaceForDiagnosisDatum }
    )
        .complete(); // To Do: Get Validator Script address

    const createTxHash = await (await (await tx).sign.withWallet().complete()).submit();

    res.status(200).json({
        status: 200,
        message: "Diagnosis deleted successfully",
        txHashs: [spendTxHash, createTxHash],
    })
}


async function getBalance(lucid) {
    const utxos = await lucid.wallet().getUtxos();
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
