import { inngest } from "../client";
import { EVENT_NAMES } from "../types";

export default inngest.createFunction(
  { id: "hello-world" },
  { event: EVENT_NAMES.DEMO_SENT },
  async ({ event, step }) => {
    await new Promise((res) => {
      setTimeout(() => {
        res(true);
      }, 3000);
    });
    return {
      message: `Hello ${event.name}!`,
    };
  }
);
