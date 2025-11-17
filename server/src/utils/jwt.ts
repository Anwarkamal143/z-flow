import { AccessTokenService, RefreshTokenService } from "./jwtService";

// ------------------- ACCESS TOKEN -------------------
export const generateAccessToken = (payload: {
  id: string;
  [key: string]: any;
}) => AccessTokenService.generate(payload);

export const verifyAccessToken = (token?: string) =>
  AccessTokenService.verify(token);

export const decodeAccessToken = (token: string | null | undefined) =>
  AccessTokenService.decode(token);

export const isAccessTokenExpiringSoon = (
  exp: number,
  windowInSeconds?: number
) => AccessTokenService.isExpiringSoon(exp, windowInSeconds);

// ------------------- REFRESH TOKEN -------------------
export const generateRefreshToken = (payload: {
  id: string;
  [key: string]: any;
}) => RefreshTokenService.generate(payload);

export const verifyRefreshToken = (token?: string) =>
  RefreshTokenService.verify(token);

export const decodeRefreshToken = (token: string | null | undefined) =>
  RefreshTokenService.decode(token);

export const isRefreshTokenExpiringSoon = (
  exp: number,
  windowInSeconds?: number
) => RefreshTokenService.isExpiringSoon(exp, windowInSeconds);
