// use cardano/address.{Credential}
use cardano/transaction.{OutputReference, Transaction}
use cardano/script_context.{ScriptContext}
// use aiken/collection/list
// use aiken/primitive/string

validator hello_world {
  spend(
    _datum: Option<Data>,
    _redeemer: Data,
    _utxo: OutputReference,
    _self: Transaction,
  ) {
    fail @"Implement this" 
  }

  // If needs be, remove any of unneeded handlers above, and use:
  
  else(_ctx: ScriptContext) {
    fail @"fallback logic if none of the other purposes match"
  }
}