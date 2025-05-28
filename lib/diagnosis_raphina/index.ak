use aiken/crypto.{VerificationKeyHash}

pub type DiagnosisRecord {
  owner: ByteArray,
  diagnosis: ByteArray,
  scanImgUrl: ByteArray,
  timestamp: Int,
  model: ByteArray,
}

pub type RequestBody {
  owner: ByteArray,
  action: ByteArray,
}

pub fn get_diagnosis_record(datum: Option<DiagnosisRecord>) {
  when datum is {
    Some(diagnosis) -> diagnosis
    None -> fail @"No Diagnosis Received"
  }
}

pub const valid_actions = ["UPDATE_DIAGNOSIS"]

/// Company wallet signature hash
pub const trusted_server: VerificationKeyHash =
  "addr_test1vznhfd79f43tmel5xz29wkphcsj0r63jea2qsum0rk08xng2l3fnk"
