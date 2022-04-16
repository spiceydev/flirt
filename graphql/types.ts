export type CreateUserInput = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  imageUrl?: string;
};

export type LoginUserInput = {
  username: string;
  password: string;
};

export type UserPayload = {
  username?: string;
  iat?: number;
  exp?: number;
};
