import { isValid } from "ulid";
import z from "zod";

export const ULIDSchema = (message: string = "Invalid ID") =>
  z.string().refine((val) => isValid(val), {
    message: message,
  });
