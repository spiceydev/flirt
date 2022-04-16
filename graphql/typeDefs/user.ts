import { gql } from 'apollo-server';

export default gql`
  type User {
    username: String!
    email: String!
    password: String!
    imageUrl: String
    createdAt: Date!
    token: String
  }

  type Query {
    getUsers: [User]!
    login(username: String!, password: String!): User!
  }

  type Mutation {
    register(
      username: String!
      email: String!
      password: String!
      confirmPassword: String!
      imageUrl: String
    ): User!
  }
`;
