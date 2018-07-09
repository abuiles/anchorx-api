import {
  Asset,
  Keypair,
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

export async function createAccountInLedger(newAccount) {
  try {
    Network.useTestNetwork();
    const stellarServer = new Server('https://horizon-testnet.stellar.org');

    // Never put values like the an account seed in code.
    const provisionerKeyPair = Keypair.fromSecret('SA72TGXRHE26WC5G5MTNURFUFBHZHTIQKF5AQWRXJMJGZUF4XY6HFWJ4')
    const issuerKeyPair = Keypair.fromSecret('SBYZ5NEJ34Y3FTKADVBO3Y76U6VLTREJSW4MXYCVMUBTL2K3V4Y644UX')

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

export async function createTrustline(accountKeypair) {
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
