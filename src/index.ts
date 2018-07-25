import { GraphQLServer } from 'graphql-yoga'
import { importSchema } from 'graphql-import'
import { Prisma } from './generated/prisma'
import {
  Context,
  addSigners,
  allowTrust,
  createAccountInLedger,
  createTrustline,
  payment
} from './utils'

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
      let user = await context.db.query.user({
        where: {
          username: username
        }
      })

      if (user) {
        return user
      }

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

      user = await context.db.mutation.createUser(
        { data },
        info
      )

      // keypair for issuing account - no bueno, use base account as
      // defined here https://www.stellar.org/developers/guides/anchor/index.html#account-structure
      const issuer = Keypair.fromSecret('SBYZ5NEJ34Y3FTKADVBO3Y76U6VLTREJSW4MXYCVMUBTL2K3V4Y644UX')

      /*
        In a production app, you don't want to block to do this
        operation or have the keys to create accounts in this same
        app. Use something like AWS lambda, or a separate system to
        provision the Stellar account.
      */
      await createAccountInLedger(keypair.publicKey())
      await createTrustline(keypair)
      await allowTrust(keypair.publicKey())
      await addSigners(keypair)
      await payment(
        issuer,
        issuer.publicKey(),
        keypair.publicKey(),
        '10'
      )

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

      const sender = result.find(u => u.username === senderUsername)
      const recipient = result.find(u => u.username === recipientUsername)

      // This is the secret key for the account added as signer with mid threshold
      const signer = Keypair.fromSecret(
        // Use something like KMS in production and run in a lambda or
        // somewhere which can not be easily access from the internet.
        'SBFSAN35IAEHVLXZY3BSEJBAND5P6YM6QLNQY3WZH7D3URL6JQEFGOGY'
      )

      try {
        const { hash } = await payment(
          signer,
          sender.stellarAccount,
          recipient.stellarAccount,
          amount
        )

        return { id: hash }
      } catch (e) {
        console.log(`failure ${e}`)

        throw e
      }
    },
    async credit(_, { amount, username }, context: Context, info) {
      const user = await context.db.query.user({
        where: {
          username: username
        }
      })

      const issuer = Keypair.fromSecret('SBYZ5NEJ34Y3FTKADVBO3Y76U6VLTREJSW4MXYCVMUBTL2K3V4Y644UX')

      try {
        const { hash } = await payment(
          issuer,
          issuer.publicKey(),
          user.stellarAccount,
          amount
        )

        return { id: hash }
      } catch (e) {
        console.log(`failure ${e}`)

        throw e
      }
    },
    async debit(_, { amount, username }, context: Context, info) {
      const user = await context.db.query.user({
        where: {
          username: username
        }
      })

      // When you send back a custom asset to the issuing account, the
      // asset you send back gets destroyed
      const issuingAccount = 'GBX67BEOABQAELIP2XTC6JXHJPASKYCIQNS7WF6GWPSCBEAJEK74HK36'

      const issuer = Keypair.fromSecret(
        // Use something like KMS in production and run in a lambda or
        // somewhere which can not be easily access from the internet.
        'SBFSAN35IAEHVLXZY3BSEJBAND5P6YM6QLNQY3WZH7D3URL6JQEFGOGY'
      )

      try {
        const { hash } = await payment(
          issuer,
          user.stellarAccount,
          issuingAccount,
          amount
        )

        console.log(`account ${keypair.publicKey()} debited - now transfer real money to ${username} bank account`)

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
