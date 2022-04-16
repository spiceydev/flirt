import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const hashPassword = async (password: string) => {
  const hashedPassword = await argon2.hash(password);
  return hashedPassword;
};

const seed = async () => {
  await prisma.user.deleteMany();
  await prisma.user.createMany({
    data: [
      {
        email: 'test@test.com',
        username: 'test',
        password: await hashPassword('test'),
      },
      {
        email: 'test2@test2.com',
        username: 'test2',
        password: await hashPassword('test2'),
      },
    ],
  });
};

seed();
