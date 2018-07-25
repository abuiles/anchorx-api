import {
  Asset,
  Keypair,
  Memo,
  Network,
  Operation,
  Server,
  TransactionBuilder
} from 'stellar-sdk'

import { Prisma } from './generated/prisma'

export interface Context {
  db: Prisma
  request: any
}

export const AnchorXUSD = new Asset(
  'USD',
  'GBX67BEOABQAELIP2XTC6JXHJPASKYCIQNS7WF6GWPSCBEAJEK74HK36'
)

export async function createAccountInLedger(newAccount: string) {
  try {
    Network.useTestNetwork();
    const stellarServer = new Server('https://horizon-testnet.stellar.org');

    // Never put values like the an account seed in code.
    const provisionerKeyPair = Keypair.fromSecret('SA72TGXRHE26WC5G5MTNURFUFBHZHTIQKF5AQWRXJMJGZUF4XY6HFWJ4')
    const provisioner = await stellarServer.loadAccount(provisionerKeyPair.publicKey())

    console.log('creating account in ledger', newAccount)

    const transaction = new TransactionBuilder(provisioner)
      .addOperation(
        Operation.createAccount({
          destination: newAccount,
          startingBalance: '2'
        })
      ).build()

    transaction.sign(provisionerKeyPair)

    const result = await stellarServer.submitTransaction(transaction);
    console.log('Account created: ', result)
  } catch (e) {
    console.log('Stellar account not created.', e)
  }
}

export async function createTrustline(accountKeypair: Keypair) {
  Network.useTestNetwork();
  const stellarServer = new Server('https://horizon-testnet.stellar.org');

  try {
    const account = await stellarServer.loadAccount(accountKeypair.publicKey())
    const transaction = new TransactionBuilder(account)
      .addOperation(
        Operation.changeTrust({
          asset: AnchorXUSD
        }))
      .build();

    transaction.sign(accountKeypair)

    const result = await stellarServer.submitTransaction(transaction)

    console.log('trustline created from  account to issuer and signers updated', result)

    return result
  } catch (e) {
    console.log('create trustline failed.', e)
  }
}

export async function allowTrust(trustor: string) {
  Network.useTestNetwork();
  const stellarServer = new Server('https://horizon-testnet.stellar.org');

  try {
    // Never store secrets in code! Use something like KMS and put
    // this somewhere were few people can access it.
    const issuingKeys = Keypair.fromSecret('SBYZ5NEJ34Y3FTKADVBO3Y76U6VLTREJSW4MXYCVMUBTL2K3V4Y644UX')
    const issuingAccount = await stellarServer.loadAccount(issuingKeys.publicKey())

    const transaction = new TransactionBuilder(issuingAccount)
      .addOperation(
        Operation.allowTrust({
          trustor,
          assetCode: AnchorXUSD.code,
          authorize: true
        })
      )
      .build();

    transaction.sign(issuingKeys);

    const result = await stellarServer.submitTransaction(transaction)

    console.log('trust allowed', result)

    return result
  } catch (e) {
    console.log('allow trust failed', e)
  }
}

export async function payment(signerKeys: Keypair, origin: string, destination: string, amount: string) {
  Network.useTestNetwork();
  const stellarServer = new Server('https://horizon-testnet.stellar.org');

  const account = await stellarServer.loadAccount(origin)

  let transaction = new TransactionBuilder(account)
    .addOperation(
      Operation.payment({
        destination,
        asset: AnchorXUSD,
        amount
      })
    ).addMemo(Memo.text('https://goo.gl/6pDRPi'))
    .build()

  transaction.sign(signerKeys)

  console.log(`sending ${amount} from ${signerKeys.publicKey()} to ${destination} `)
  try {
    const result = await stellarServer.submitTransaction(transaction)

    return result
  } catch (e) {
    console.log(`failure ${e}`)
    throw e
  }
}

export async function addSigners(keypair: Keypair) {
  Network.useTestNetwork();
  const stellarServer = new Server('https://horizon-testnet.stellar.org');

  const paymentsId = 'GCQOZGXMH6MI3JKWWO365BCXUJN6MFZR7XMKKCHGDY2K6JNCYFRH6M4C'
  const adminId = 'GA6KTSHWU6GX6ER6HTWMGONS4VLQ4ZHONU6RKBGXTT7HFLV6NHX3ONAL'

  const account = await stellarServer.loadAccount(newAccountKeypair.publicKey())

  var transaction = new TransactionBuilder(account)
    .addOperation(
      Operation.setOptions({
        signer: {
          ed25519PublicKey: paymentsId,
          weight: 2
        }
      })
    )
    .addOperation(
      Operation.setOptions({
        signer: {
          ed25519PublicKey: adminId,
          weight: 5
        }
      }))
    .addOperation(
      Operation.setOptions({
        masterWeight: 0, // set master key weight to 0, it can't do anything
        lowThreshold: 1,
        medThreshold: 2, // Allows  paymentsId to send payments
        highThreshold: 5 // Allows adminId to manage account
      }))
    .build();

  transaction.sign(keypair)

  const result = await server.submitTransaction(transaction)

}
