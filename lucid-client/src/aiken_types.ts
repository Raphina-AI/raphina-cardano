import { Data } from "@lucid-evolution/lucid";

export const DiagnosisDatumDataType = Data.Object({
    owner: Data.Integer(),
    scanImg: Data.Bytes(),
    diagnosis: Data.Bytes(),
    timestamp: Data.Integer(),
    model: Data.Bytes()
}, {
    hasConstr: true
})

export const DiagnosisDatumDataType2 = Data.Object({
    owner: Data.Bytes(),
    scanImg: Data.Bytes(),
    diagnosis: Data.Bytes(),
    timestamp: Data.Integer(),
    model: Data.Bytes()
}, {
    hasConstr: true
})

export const RedeemerDataType = Data.Object({
    owner: Data.Bytes(),
    action: Data.Bytes()
}, {
    hasConstr: true
})