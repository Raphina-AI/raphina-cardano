# Diagnosis Raphina - Medical Records on Cardano

## What is this?

This is a simple blockchain app that helps store and update medical diagnoses on the Cardano blockchain. Think of it as a secure digital filing cabinet for medical records that nobody can tamper with.

## How it works

### Storing a diagnosis
You can save a patient's diagnosis on the blockchain. Each record includes:
- Who owns the record
- The actual diagnosis (like "Patient has a cold")
- When it was recorded
- Which medical model was used

### Viewing a diagnosis
Anyone with permission can look up a diagnosis without changing it. It's like reading a file without editing it.

### Updating a diagnosis
Sometimes diagnoses change! When this happens:
- You need to be the record owner
- You need the trusted medical server to approve it
- You specify the action as "UPDATE DIAGNOSIS"

## Why use this?

- **Security**: Records can't be changed without permission
- **Trust**: A verified medical server must approve updates
- **Transparency**: Every change is recorded permanently
- **Peace of mind**: Patient data stays safe and accurate

## Getting started

1. Install Aiken (the language this is written in)
2. Clone repo `git clone https://github.com/Raphina-AI/raphina-cardano.git`
3. Build the project with `aiken build`
4. Connect it to your medical system

## How to test it

We've included a simple test that shows how updating a diagnosis works. Run it with `aiken check`.

## Lucid Server Endpoints
We've included a node js project for test, ( lucid-client )

With two Endpoints
Store diagnosis
url: localhost:3000/storeDiagnosis
method: POST
payload: {
  userId: Integer,
  password: String,
  diagnosis: String,
  model: String
}

Retrieve diagnosis
url: localhost:3000/getDiagnosis
method: POST
payload: {
  userId: Integer,
  password: String,
}

## To run Client
1. Install Node js
2. Clone repo `git clone https://github.com/Raphina-AI/raphina-cardano.git`
3. Enter Lucid-client Directory `cd lucid-client`
4. Install Dependencies `npm i`
5. Create .env file in lucid-client directory (`/lucid-client`)
6. Copy the contents of .env.test the .env file you just made
7. Run `npm run start`

## Endpoints to be made
Filter Diagnosis Endpoints,
Update Diagnosis Endpoints

## Further Goals
Make Diagnosis into NFTs
Interact with the raphina AI directly after deployment and further working

## Need help?

This is a work in progress! Feel free to ask questions or suggest improvements.

---

*Note: This is a prototype. Please don't use it for real medical records just yet!, all Envs are dummy envs*
