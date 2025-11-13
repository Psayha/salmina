// Backend types

export interface JwtPayload {
  userId: string;
  telegramId: string;
  role: "USER" | "ADMIN";
}

export interface RequestWithUser extends Express.Request {
  user?: {
    id: string;
    telegramId: string;
    role: "USER" | "ADMIN";
  };
}

