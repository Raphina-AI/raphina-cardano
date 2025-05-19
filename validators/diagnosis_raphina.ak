use aiken/collection/list
use aiken/primitive/string
use cardano/script_context.{ScriptContext}
// use cardano/address.{Credential}
use cardano/transaction.{OutputReference, Transaction}
use diagnosis_raphina/index.{
  DiagnosisRecord, RequestBody, get_diagnosis_record, trusted_server,
}

validator diagnosis_raphina {
  /// Action to Destroy an existing Diagnosis by using it's utxo, Performed During an update diagnosis
  spend(
    datum: Option<DiagnosisRecord>,
    redeemer: RequestBody,
    _utxo: OutputReference,
    self: Transaction,
  ) {
    // Get the owner of the diagnosis from the existing datum
    let DiagnosisRecord { owner, .. } = get_diagnosis_record(datum)

    let RequestBody { owner: owner_r, action } = redeemer

    let valid_signer = list.has(self.extra_signatories, trusted_server)

    trace @"Spending the utxo with a diagnosis, action": string.from_bytearray(
      action,
    )

    let valid_action = action == "UPDATE DIAGNOSIS"
    let valid_owner = owner == owner_r

    valid_action? && valid_owner? && valid_signer?
  }

  // If needs be, remove any of unneeded handlers above, and use:
  /// Actions that can be prformed while unlocking utxo, only valid one atm is updating diagnosis
  else(_ctx: ScriptContext) {
    fail @"fallback logic if none of the other purposes match"
  }
}

/// To store diagnosis, u simply need to lock utxos to this script and attach the diagnosis datum
/// To retrieve, the datum on the locked utxo is read
/// Test to update diagnosis
test updating_a_diagnosis() {
  let datum =
    DiagnosisRecord {
      owner: 1,
      scanImgUrl: "https://example.com/scan.jpg",
      diagnosis: "Johnson is healthy",
      timestamp: 128127372,
      model: "v2",
    }
  let redeemer = RequestBody { owner: 1, action: "UPDATE DIAGNOSIS" }
  let placeholder_utxo = OutputReference { transaction_id: "", output_index: 0 }
  diagnosis_raphina.spend(
    Some(datum),
    redeemer,
    placeholder_utxo,
    Transaction {
      ..transaction.placeholder,
      extra_signatories: [
        "addr1vy9wvtxnln83zlfz430ynq0cy3yuypmp3ksm0whgrh8xl6qf5r0zq",
      ],
    },
  )
}
