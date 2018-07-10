import { GraphQLServer } from 'graphql-yoga'
import { importSchema } from 'graphql-import'
import { Prisma } from './generated/prisma'
import {
  Context,
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
      await createTrustline(keypair)
      await allowTrust(keypair.publicKey())
      await payment(
        // keypair for issuing account - no bueno, we'll replace this later
        Keypair.fromSecret('SBYZ5NEJ34Y3FTKADVBO3Y76U6VLTREJSW4MXYCVMUBTL2K3V4Y644UX'),
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

      const signerKeys = Keypair.fromSecret(
        // Use something like KMS in production
        AES.decrypt(
          sender.stellarSeed,
          ENVCryptoSecret
        ).toString(enc.Utf8)
      )

      try {
        const { hash } = await payment(
          signerKeys,
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

      try {
        const { hash } = await payment(
          // keypair for issuing account - no bueno
          Keypair.fromSecret('SBYZ5NEJ34Y3FTKADVBO3Y76U6VLTREJSW4MXYCVMUBTL2K3V4Y644UX'),
          user.stellarAccount,
          amount
        )

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
