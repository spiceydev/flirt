import { ApolloError, AuthenticationError } from 'apollo-server';
import { ExpressContext } from 'apollo-server-express';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import prisma from '../../services/prisma';
import {
  UserAuthenticationRules,
  UserRegistrationRules,
} from '../../validations/user';
import { CreateUserInput, LoginUserInput, UserPayload } from '../types';

export default {
  Query: {
    getUsers: async (_: any, __: any, context: ExpressContext) => {
      try {
        let user: UserPayload = {};
        if (context.req && context.req.headers.authorization) {
          const token = context.req.headers.authorization.split('Bearer ')[1];
          jwt.verify(token, process.env.JWT_SECRET!, (err, decodedToken) => {
            if (err) {
              throw new AuthenticationError('Unauthenticated');
            }
            user = decodedToken as UserPayload;
          });
        }

        const users = await prisma.user.findMany({
          where: { username: { not: user.username } },
        });

        return users;
      } catch (err) {
        console.log(err);
      }
    },

    login: async (_: any, args: LoginUserInput) => {
      const { username, password } = args;
      await UserAuthenticationRules.validate(
        { username, password },
        { abortEarly: false }
      );

      try {
        const user = await prisma.user.findUnique({
          where: { username },
        });

        if (!user) {
          throw new ApolloError('Username not found', '404');
        }

        const isValidPassword = await argon2.verify(user.password, password);

        if (!isValidPassword) {
          throw new ApolloError('Username not found', '403');
        }

        const token = jwt.sign({ username }, process.env.JWT_SECRET!, {
          expiresIn: 60 * 60,
        });

        return {
          ...user,
          createdAt: user.createdAt,
          token,
        };
      } catch (err) {
        console.log(err);
      }
    },
  },
  Mutation: {
    register: async (_: any, args: CreateUserInput) => {
      const { username, email, password, confirmPassword, imageUrl } = args;
      await UserRegistrationRules.validate(
        { username, email, password, confirmPassword, imageUrl },
        { abortEarly: false }
      );

      try {
        let user = await prisma.user.findUnique({
          where: { username },
        });

        if (user) {
          throw new ApolloError('Username is already registered.', '403');
        }

        user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          throw new ApolloError('Email is already registered.', '403');
        }

        const hashedPassword = await argon2.hash(password);

        const newUser = await prisma.user.create({
          data: {
            username,
            email,
            password: hashedPassword,
            imageUrl,
          },
        });

        return newUser;
      } catch (err) {
        console.log(err);
      }
    },
  },
};
