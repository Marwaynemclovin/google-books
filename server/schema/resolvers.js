const { User, Book } = require('./models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('./utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      // make sure the user is authenticated
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to view your profile');
      }

      // find the authenticated user by ID
      const user = await User.findById(context.user._id).populate('savedBooks');

      return user;
    },
  },

  Mutation: {
    login: async (parent, { email, password }) => {
      // find the user by email
      const user = await User.findOne({ email });

      // if user not found or password is incorrect, throw an error
      if (!user || !user.isCorrectPassword(password)) {
        throw new AuthenticationError('Incorrect email or password');
      }

      // sign a JWT token and return it with the user object
      const token = signToken(user);
      return { token, user };
    },

    addUser: async (parent, { username, email, password }) => {
      // create a new user object
      const user = new User({ username, email, password });

      try {
        // save the new user to the database
        await user.save();

        // sign a JWT token and return it with the new user object
        const token = signToken(user);
        return { token, user };
      } catch (err) {
        throw new Error('Failed to create user');
      }
    },

    saveBook: async (parent, { input }, context) => {
      // make sure the user is authenticated
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to save a book');
      }

      // create a new book object from the input data
      const { bookId, authors, description, title, image, link } = input;
      const newBook = { bookId, authors, description, title, image, link };

      try {
        // find the user by ID and update their saved books array
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: newBook } },
          { new: true }
        ).populate('savedBooks');

        return updatedUser;
      } catch (err) {
        throw new Error('Failed to save book');
      }
    },

    removeBook: async (parent, { bookId }, context) => {
      // make sure the user is authenticated
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to remove a book');
      }

      try {
        // find the user by ID and remove the book from their saved books array
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        ).populate('savedBooks');

        return updatedUser;
      } catch (err) {
        throw new Error('Failed to remove book');
      }
    },
  },

  User: {
    savedBooks: async ({ savedBooks }) => {
      // populate the savedBooks array with Book objects
      const books = await Book.find({ bookId: { $in: savedBooks } });
      return books;
    },
  },
};

module.exports = resolvers;