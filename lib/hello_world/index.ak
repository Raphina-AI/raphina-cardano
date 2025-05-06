use aiken/crypto.{VerificationKeyHash}

pub type Datum {
  Datum { owner: VerificationKeyHash }
}

pub type Redeemer {
  Redeemer(ByteArray)
}

pub fn get_owner(data: Option<Datum>) {
  when data is {
    None -> fail @"Invalid Data Passedd"
    Some(Datum { owner }) -> owner
  }
}
