import { GraphQLResolveInfo, GraphQLSchema } from 'graphql'
import { IResolvers } from 'graphql-tools/dist/Interfaces'
import { Options } from 'graphql-binding'
import { makePrismaBindingClass, BasePrismaOptions } from 'prisma-binding'

export interface Query {
    users: <T = User[]>(args: { where?: UserWhereInput, orderBy?: UserOrderByInput, skip?: Int, after?: String, before?: String, first?: Int, last?: Int }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    user: <T = User | null>(args: { where: UserWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    usersConnection: <T = UserConnection>(args: { where?: UserWhereInput, orderBy?: UserOrderByInput, skip?: Int, after?: String, before?: String, first?: Int, last?: Int }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    node: <T = Node | null>(args: { id: ID_Output }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> 
  }

export interface Mutation {
    createUser: <T = User>(args: { data: UserCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateUser: <T = User | null>(args: { data: UserUpdateInput, where: UserWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteUser: <T = User | null>(args: { where: UserWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertUser: <T = User>(args: { where: UserWhereUniqueInput, create: UserCreateInput, update: UserUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyUsers: <T = BatchPayload>(args: { data: UserUpdateInput, where?: UserWhereInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyUsers: <T = BatchPayload>(args: { where?: UserWhereInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> 
  }

export interface Subscription {
    user: <T = UserSubscriptionPayload | null>(args: { where?: UserSubscriptionWhereInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T>> 
  }

export interface Exists {
  User: (where?: UserWhereInput) => Promise<boolean>
}

export interface Prisma {
  query: Query
  mutation: Mutation
  subscription: Subscription
  exists: Exists
  request: <T = any>(query: string, variables?: {[key: string]: any}) => Promise<T>
  delegate(operation: 'query' | 'mutation', fieldName: string, args: {
    [key: string]: any;
}, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<any>;
delegateSubscription(fieldName: string, args?: {
    [key: string]: any;
}, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<AsyncIterator<any>>;
getAbstractResolvers(filterSchema?: GraphQLSchema | string): IResolvers;
}

export interface BindingConstructor<T> {
  new(options: BasePrismaOptions): T
}
/**
 * Type Defs
*/

const typeDefs = `type AggregateUser {
  count: Int!
}

type BatchPayload {
  """The number of nodes that have been affected by the Batch operation."""
  count: Long!
}

"""
The \`Long\` scalar type represents non-fractional signed whole numeric values.
Long can represent values between -(2^63) and 2^63 - 1.
"""
scalar Long

type Mutation {
  createUser(data: UserCreateInput!): User!
  updateUser(data: UserUpdateInput!, where: UserWhereUniqueInput!): User
  deleteUser(where: UserWhereUniqueInput!): User
  upsertUser(where: UserWhereUniqueInput!, create: UserCreateInput!, update: UserUpdateInput!): User!
  updateManyUsers(data: UserUpdateInput!, where: UserWhereInput): BatchPayload!
  deleteManyUsers(where: UserWhereInput): BatchPayload!
}

enum MutationType {
  CREATED
  UPDATED
  DELETED
}

"""An object with an ID"""
interface Node {
  """The id of the object."""
  id: ID!
}

"""Information about pagination in a connection."""
type PageInfo {
  """When paginating forwards, are there more items?"""
  hasNextPage: Boolean!

  """When paginating backwards, are there more items?"""
  hasPreviousPage: Boolean!

  """When paginating backwards, the cursor to continue."""
  startCursor: String

  """When paginating forwards, the cursor to continue."""
  endCursor: String
}

type Query {
  users(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [User]!
  user(where: UserWhereUniqueInput!): User
  usersConnection(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): UserConnection!

  """Fetches an object given its ID"""
  node(
    """The ID of an object"""
    id: ID!
  ): Node
}

type Subscription {
  user(where: UserSubscriptionWhereInput): UserSubscriptionPayload
}

type User implements Node {
  id: ID!
  username: String!
  stellarAccount: String!
  stellarSeed: String!
}

"""A connection to a list of items."""
type UserConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [UserEdge]!
  aggregate: AggregateUser!
}

input UserCreateInput {
  username: String!
  stellarAccount: String!
  stellarSeed: String!
}

"""An edge in a connection."""
type UserEdge {
  """The item at the end of the edge."""
  node: User!

  """A cursor for use in pagination."""
  cursor: String!
}

enum UserOrderByInput {
  id_ASC
  id_DESC
  username_ASC
  username_DESC
  stellarAccount_ASC
  stellarAccount_DESC
  stellarSeed_ASC
  stellarSeed_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

type UserPreviousValues {
  id: ID!
  username: String!
  stellarAccount: String!
  stellarSeed: String!
}

type UserSubscriptionPayload {
  mutation: MutationType!
  node: User
  updatedFields: [String!]
  previousValues: UserPreviousValues
}

input UserSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [UserSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [UserSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [UserSubscriptionWhereInput!]

  """
  The subscription event gets dispatched when it's listed in mutation_in
  """
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: UserWhereInput
}

input UserUpdateInput {
  username: String
  stellarAccount: String
  stellarSeed: String
}

input UserWhereInput {
  """Logical AND on all given filters."""
  AND: [UserWhereInput!]

  """Logical OR on all given filters."""
  OR: [UserWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [UserWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  username: String

  """All values that are not equal to given value."""
  username_not: String

  """All values that are contained in given list."""
  username_in: [String!]

  """All values that are not contained in given list."""
  username_not_in: [String!]

  """All values less than the given value."""
  username_lt: String

  """All values less than or equal the given value."""
  username_lte: String

  """All values greater than the given value."""
  username_gt: String

  """All values greater than or equal the given value."""
  username_gte: String

  """All values containing the given string."""
  username_contains: String

  """All values not containing the given string."""
  username_not_contains: String

  """All values starting with the given string."""
  username_starts_with: String

  """All values not starting with the given string."""
  username_not_starts_with: String

  """All values ending with the given string."""
  username_ends_with: String

  """All values not ending with the given string."""
  username_not_ends_with: String
  stellarAccount: String

  """All values that are not equal to given value."""
  stellarAccount_not: String

  """All values that are contained in given list."""
  stellarAccount_in: [String!]

  """All values that are not contained in given list."""
  stellarAccount_not_in: [String!]

  """All values less than the given value."""
  stellarAccount_lt: String

  """All values less than or equal the given value."""
  stellarAccount_lte: String

  """All values greater than the given value."""
  stellarAccount_gt: String

  """All values greater than or equal the given value."""
  stellarAccount_gte: String

  """All values containing the given string."""
  stellarAccount_contains: String

  """All values not containing the given string."""
  stellarAccount_not_contains: String

  """All values starting with the given string."""
  stellarAccount_starts_with: String

  """All values not starting with the given string."""
  stellarAccount_not_starts_with: String

  """All values ending with the given string."""
  stellarAccount_ends_with: String

  """All values not ending with the given string."""
  stellarAccount_not_ends_with: String
  stellarSeed: String

  """All values that are not equal to given value."""
  stellarSeed_not: String

  """All values that are contained in given list."""
  stellarSeed_in: [String!]

  """All values that are not contained in given list."""
  stellarSeed_not_in: [String!]

  """All values less than the given value."""
  stellarSeed_lt: String

  """All values less than or equal the given value."""
  stellarSeed_lte: String

  """All values greater than the given value."""
  stellarSeed_gt: String

  """All values greater than or equal the given value."""
  stellarSeed_gte: String

  """All values containing the given string."""
  stellarSeed_contains: String

  """All values not containing the given string."""
  stellarSeed_not_contains: String

  """All values starting with the given string."""
  stellarSeed_starts_with: String

  """All values not starting with the given string."""
  stellarSeed_not_starts_with: String

  """All values ending with the given string."""
  stellarSeed_ends_with: String

  """All values not ending with the given string."""
  stellarSeed_not_ends_with: String
}

input UserWhereUniqueInput {
  id: ID
  username: String
}
`

export const Prisma = makePrismaBindingClass<BindingConstructor<Prisma>>({typeDefs})

/**
 * Types
*/

export type UserOrderByInput =   'id_ASC' |
  'id_DESC' |
  'username_ASC' |
  'username_DESC' |
  'stellarAccount_ASC' |
  'stellarAccount_DESC' |
  'stellarSeed_ASC' |
  'stellarSeed_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC'

export type MutationType =   'CREATED' |
  'UPDATED' |
  'DELETED'

export interface UserCreateInput {
  username: String
  stellarAccount: String
  stellarSeed: String
}

export interface UserWhereUniqueInput {
  id?: ID_Input
  username?: String
}

export interface UserUpdateInput {
  username?: String
  stellarAccount?: String
  stellarSeed?: String
}

export interface UserSubscriptionWhereInput {
  AND?: UserSubscriptionWhereInput[] | UserSubscriptionWhereInput
  OR?: UserSubscriptionWhereInput[] | UserSubscriptionWhereInput
  NOT?: UserSubscriptionWhereInput[] | UserSubscriptionWhereInput
  mutation_in?: MutationType[] | MutationType
  updatedFields_contains?: String
  updatedFields_contains_every?: String[] | String
  updatedFields_contains_some?: String[] | String
  node?: UserWhereInput
}

export interface UserWhereInput {
  AND?: UserWhereInput[] | UserWhereInput
  OR?: UserWhereInput[] | UserWhereInput
  NOT?: UserWhereInput[] | UserWhereInput
  id?: ID_Input
  id_not?: ID_Input
  id_in?: ID_Input[] | ID_Input
  id_not_in?: ID_Input[] | ID_Input
  id_lt?: ID_Input
  id_lte?: ID_Input
  id_gt?: ID_Input
  id_gte?: ID_Input
  id_contains?: ID_Input
  id_not_contains?: ID_Input
  id_starts_with?: ID_Input
  id_not_starts_with?: ID_Input
  id_ends_with?: ID_Input
  id_not_ends_with?: ID_Input
  username?: String
  username_not?: String
  username_in?: String[] | String
  username_not_in?: String[] | String
  username_lt?: String
  username_lte?: String
  username_gt?: String
  username_gte?: String
  username_contains?: String
  username_not_contains?: String
  username_starts_with?: String
  username_not_starts_with?: String
  username_ends_with?: String
  username_not_ends_with?: String
  stellarAccount?: String
  stellarAccount_not?: String
  stellarAccount_in?: String[] | String
  stellarAccount_not_in?: String[] | String
  stellarAccount_lt?: String
  stellarAccount_lte?: String
  stellarAccount_gt?: String
  stellarAccount_gte?: String
  stellarAccount_contains?: String
  stellarAccount_not_contains?: String
  stellarAccount_starts_with?: String
  stellarAccount_not_starts_with?: String
  stellarAccount_ends_with?: String
  stellarAccount_not_ends_with?: String
  stellarSeed?: String
  stellarSeed_not?: String
  stellarSeed_in?: String[] | String
  stellarSeed_not_in?: String[] | String
  stellarSeed_lt?: String
  stellarSeed_lte?: String
  stellarSeed_gt?: String
  stellarSeed_gte?: String
  stellarSeed_contains?: String
  stellarSeed_not_contains?: String
  stellarSeed_starts_with?: String
  stellarSeed_not_starts_with?: String
  stellarSeed_ends_with?: String
  stellarSeed_not_ends_with?: String
}

/*
 * An object with an ID

 */
export interface Node {
  id: ID_Output
}

export interface UserPreviousValues {
  id: ID_Output
  username: String
  stellarAccount: String
  stellarSeed: String
}

export interface BatchPayload {
  count: Long
}

/*
 * Information about pagination in a connection.

 */
export interface PageInfo {
  hasNextPage: Boolean
  hasPreviousPage: Boolean
  startCursor?: String
  endCursor?: String
}

export interface UserSubscriptionPayload {
  mutation: MutationType
  node?: User
  updatedFields?: String[]
  previousValues?: UserPreviousValues
}

export interface User extends Node {
  id: ID_Output
  username: String
  stellarAccount: String
  stellarSeed: String
}

/*
 * A connection to a list of items.

 */
export interface UserConnection {
  pageInfo: PageInfo
  edges: UserEdge[]
  aggregate: AggregateUser
}

export interface AggregateUser {
  count: Int
}

/*
 * An edge in a connection.

 */
export interface UserEdge {
  node: User
  cursor: String
}

/*
The `Boolean` scalar type represents `true` or `false`.
*/
export type Boolean = boolean

/*
The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.
*/
export type String = string

/*
The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. 
*/
export type Int = number

/*
The `Long` scalar type represents non-fractional signed whole numeric values.
Long can represent values between -(2^63) and 2^63 - 1.
*/
export type Long = string

/*
The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.
*/
export type ID_Input = string | number
export type ID_Output = string