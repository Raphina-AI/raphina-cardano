use aiken/crypto.{VerificationKeyHash}

pub type DiagnosisRecord {
    owner: Int,
    diagnosis: ByteArray,
    timestamp: Int,
    model: ByteArray
}

pub type RequestBody {
    owner: Int,
    action: ByteArray
}

pub fn get_diagnosis_record(datum: Option<DiagnosisRecord>) {
    when datum is {
        Some(diagnosis) -> diagnosis
        None -> fail @"No Diagnosis Received"
    }
}


/// Company wallet signature hash
pub const trusted_server: VerificationKeyHash = "addr1vy9wvtxnln83zlfz430ynq0cy3yuypmp3ksm0whgrh8xl6qf5r0zq"