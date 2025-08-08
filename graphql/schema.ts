export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    username: String!
    password: String!
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User!
  }

  type Mutation {
    createUser(email: String!, username: String!, password: String!): User!
    updateUser(id: ID!, email: String, username: String, password: String, role: String): User!
    deleteUser(id: ID!): Boolean!
  }
`;

