import { GraphQLServer } from 'graphql-yoga'
import { importSchema } from 'graphql-import'
import { Prisma } from './generated/prisma'
import { Context, createAccountInLedger } from './utils'

import {
  Asset,
  Keypair,
  Memo,
  Network,
  Operation,
  Server,
  TransactionBuilder
} from 'stellar-sdk'

import { AES, enc } from 'crypto-js'

const ENVCryptoSecret = 'StellarIsAwesome-But-Do-Not-Put-This-Value-In-Code'

const resolvers = {
  Query: {
    user(_, { username }, context: Context, info) {
      return context.db.query.user(
        {
          where: {
            username
          }
        },
        info
      )
    }
  },
  Mutation: {
    async signup(_, { username }, context: Context, info) {
      const keypair = Keypair.random()

      const secret = AES.encrypt(
        keypair.secret(),
        ENVCryptoSecret
      ).toString()

      const data = {
        username,
        stellarAccount: keypair.publicKey(),
        stellarSeed: secret
      }

      const user = await context.db.mutation.createUser(
        { data },
        info
      )

      /*
        In a production app, you don't want to block to do this
        operation or have the keys to create accounts in this same
        app. Use something like AWS lambda, or a separate system to
        provision the Stellar account.
      */

      await createAccountInLedger(keypair.publicKey())

      return user
    },
    /*
      For production apps don't rely  on the API to send you the senderUsername!

      It should be based on the Auth/session token.
    */
    async payment(_, { amount, senderUsername, recipientUsername, memo }, context: Context, info) {
      const result = await context.db.query.users({
        where: {
          username_in: [senderUsername, recipientUsername]
        }
      })

      const [sender, recipient] = result

      Network.useTestNetwork();
      const stellarServer = new Server('https://horizon-testnet.stellar.org');

      const signerKeys = Keypair.fromSecret(
        // Use something like KMS in production
        AES.decrypt(
          sender.stellarSeed,
          ENVCryptoSecret
        ).toString(enc.Utf8)
      )

      const account = await stellarServer.loadAccount(sender.stellarAccount)

      /*
        Payments require an asset type, for now users will be sending
        lumens. In the next chapter you'll create a custom asset
        representing Dollars and use it.
      */
      const asset = Asset.native()

      let transaction = new TransactionBuilder(account)
        .addOperation(
          Operation.payment({
            destination: recipient.stellarAccount,
            asset,
            amount
          })
        ).addMemo(Memo.text('https://goo.gl/6pDRPi'))
        .build()

      transaction.sign(signerKeys)

      try {
        const { hash } = await stellarServer.submitTransaction(transaction)

        return { id: hash }
      } catch (e) {
        console.log(`failure ${e}`)

        throw e
      }
    }
  },
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      endpoint: 'https://us1.prisma.sh/public-gravelcloud-78/anchorx-api/dev', // the endpoint of the Prisma API
      debug: true, // log all GraphQL queries & mutations sent to the Prisma API
      // secret: 'mysecret123', // only needed if specified in `database/prisma.yml`
    }),
  }),
})
server.start(() => console.log('Server is running on http://localhost:4000'))
