import crypto from "crypto";
import pluralize from "pluralize";
import { ulid } from "ulid";
import z from "zod";
export const stringToNumber = (
  strNumber?: string | number | null
): number | undefined => {
  if (strNumber === null || strNumber === undefined) return undefined;

  // Handle number input
  if (typeof strNumber === "number") {
    return isNaN(strNumber) ? undefined : strNumber;
  }

  // Handle string input
  if (typeof strNumber !== "string") return undefined;

  const trimmed = strNumber.trim();
  if (trimmed === "") return undefined;

  // Use Number() for more predictable parsing
  // Or use parseFloat() for more permissive parsing

  // Option 1: Strict parsing (recommended)
  const num = Number(trimmed);
  if (isNaN(num) || !isFinite(num)) return undefined;

  // Option 2: For integers only
  // const num = parseInt(trimmed, 10);
  // if (isNaN(num)) return undefined;

  return num;
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

export function getSingularPlural(name: string) {
  const plural = pluralize.plural(name);
  const singular = pluralize.singular(name);

  return { singular, plural };
}
export const sleep = (ms: number = 5000): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
