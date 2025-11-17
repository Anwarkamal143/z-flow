import crypto from "crypto";
import { ulid } from "ulid";
import z from "zod";
export const stringToNumber = (
  strNumber?: string | number
): number | undefined => {
  if (strNumber === null || strNumber === undefined) return undefined;
  const strTypeof = typeof strNumber;
  if (strTypeof !== "string" && strTypeof !== "number") return undefined;
  if (strTypeof === "string" && (strNumber as string).trim() == "")
    return undefined;
  const number = 1 * (strNumber as unknown as number);
  return isNaN(number) ? undefined : number;
};
export function generateJti() {
  return crypto.randomBytes(16).toString("hex");
}
export const wait = (ms = 500) => {
  return new Promise((res) => setTimeout(res, ms));
};
export function generateUlid() {
  return ulid();
}

export function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join(".") || "(root)",
    message: issue.message,
  }));
}
