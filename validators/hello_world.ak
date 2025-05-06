use aiken/collection/list
use aiken/primitive/string
use cardano/script_context.{ScriptContext}
// use cardano/address.{Credential}
use cardano/transaction.{OutputReference, Transaction}
use hello_world/index.{Datum, Redeemer, get_owner}

validator hello_world {
  spend(
    datum: Option<Datum>,
    redeemer: Redeemer,
    _utxo: OutputReference,
    self: Transaction,
  ) {
    let owner = get_owner(datum)
    let must_be_signed = list.has(self.extra_signatories, owner)

    let Redeemer(msg) = redeemer

    trace @"message": string.from_bytearray(msg)

    let must_say_hello_world = msg == "Hello, World!"

    must_be_signed? && must_say_hello_world?
  }

  // If needs be, remove any of unneeded handlers above, and use:
  else(_ctx: ScriptContext) {
    fail @"fallback logic if none of the other purposes match"
  }
}

// ... rest of the code is unchanged
test hello_world_example() {
  let datum =
    Datum { owner: #"00000000000000000000000000000000000000000000000000000000" }
  let redeemer = Redeemer("Hello, World!")
  let placeholder_utxo = OutputReference { transaction_id: "", output_index: 0 }
  hello_world.spend(
    Some(datum),
    redeemer,
    placeholder_utxo,
    Transaction { ..transaction.placeholder, extra_signatories: [datum.owner] },
  )
}
