import { Inngest } from "inngest";
import { schemas } from "./types";
export const inngest = new Inngest({
  id: "zFlow",
  schemas,
  ...(process.env.NODE_ENV === "production" && {
    eventKey: process.env.INNGEST_EVENT_KEY!,
    signingKey: process.env.INNGEST_SIGNING_KEY,
  }),
  env: process.env.INNGEST_DEV ? "dev" : "production",
});
