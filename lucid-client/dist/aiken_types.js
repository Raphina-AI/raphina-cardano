"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedeemerDataType = exports.DiagnosisDatumDataType2 = exports.DiagnosisDatumDataType = void 0;
const lucid_1 = require("@lucid-evolution/lucid");
exports.DiagnosisDatumDataType = lucid_1.Data.Object({
    owner: lucid_1.Data.Integer(),
    scanImg: lucid_1.Data.Bytes(),
    diagnosis: lucid_1.Data.Bytes(),
    timestamp: lucid_1.Data.Integer(),
    model: lucid_1.Data.Bytes()
}, {
    hasConstr: true
});
exports.DiagnosisDatumDataType2 = lucid_1.Data.Object({
    owner: lucid_1.Data.Bytes(),
    scanImg: lucid_1.Data.Bytes(),
    diagnosis: lucid_1.Data.Bytes(),
    timestamp: lucid_1.Data.Integer(),
    model: lucid_1.Data.Bytes()
}, {
    hasConstr: true
});
exports.RedeemerDataType = lucid_1.Data.Object({
    owner: lucid_1.Data.Bytes(),
    action: lucid_1.Data.Bytes()
}, {
    hasConstr: true
});
