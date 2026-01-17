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

export const isNotEmpty = (value: unknown): boolean => {
  if (value == null) return false;

  // string: non-whitespace characters
  if (typeof value == "string") {
    return value.trim().length > 0;
  }

  // number: finite values count as non-empty
  if (typeof value == "number") {
    return Number.isFinite(value);
  }

  // boolean: always has a value
  if (typeof value == "boolean") {
    return true;
  }

  // array: must have at least one item
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  // object: must have at least one key
  if (typeof value == "object") {
    return Object.keys(value).length > 0;
  }

  return false;
};
export function isValidUrl(value: string) {
  try {
    new URL(value.startsWith("http") ? value : `https://${value}`);
    return true;
  } catch {
    return false;
  }
}
export function parseAndNormalizeUrl(input) {
  if (typeof input !== "string") return null;

  try {
    const trimmed = input.trim();

    // Add protocol if missing
    const url = new URL(
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`
    );

    // Allow only http/https
    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    // Normalize
    url.hash = ""; // remove #
    url.pathname = url.pathname.replace(/\/+$/, ""); // remove trailing slash

    return url.toString();
  } catch {
    return null;
  }
}

export const removeVersionFromBasePath = (path: string) => {
  if (!path) {
    return "";
  }
  try {
    return path.replace(/\/v\d+$/, "");
  } catch (error) {
    return "";
  }
};
