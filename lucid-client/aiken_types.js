import { Data } from "lucid-cardano";

export const DiagnosisDatumDataType = Data.Object({
    owner: Data.Integer(),
    scanImg: Data.Bytes(),
    diagnosis: Data.Bytes(),
    timestamp: Data.Integer(),
    model: Data.Bytes()
}, {
    hasConstr: true
})