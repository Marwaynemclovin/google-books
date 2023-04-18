const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type User {
        _id: ID
        username: String
        email: String
        bookCount: Int
        savedBooks: [User]!
    }

    type Book {
        bookId: String!
        authors: [String!]!
        description: String
        title: String!
        image: String
        link: String
      }

    type Auth {
        token: ID!
        user: User
    }
    
    type Query {
        me: User
    }

    input BookInput {
        _id: ID
        authors: [String]
        description: String
        bookID: String
        image: String
        forSale: String
        link: String
        title: String
    }

    type Mutation {
        login(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        saveBook(input: BookInput!): User
        removeBook(bookId: String!): User
      }
`

module.exports = typeDefs;