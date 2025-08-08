import { gql } from "@apollo/client";

export const CREATE_USER = gql`
  mutation CreateUser($email: String!, $username: String!, $password: String!) {
    createUser(email: $email, username: $username, password: $password) {
      id
      email
      username
      role
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
      username
      }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $email: String, $username: String, $password: String, $role: String) {
    updateUser(id: $id, email: $email, username: $username, password: $password, role: $role) {
      id
      email
      username
      role
      createdAt
      updatedAt
    }
  }
`;