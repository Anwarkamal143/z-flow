import { EventSchemas } from "inngest";

/**
 * ---- Event Definitions ----
 * Add all your events here
 */
export enum EVENT_NAMES {
  DEMO_SENT = "demo/event.test",
  USER_REGISTERED = "user/registered",
}
export type DemoEventSent = {
  name: EVENT_NAMES.DEMO_SENT;
  data: {
    message: string;
  };
};

export type UserRegistered = {
  name: EVENT_NAMES.USER_REGISTERED;
  data: {
    userId: string;
    email: string;
  };
};

/**
 * ---- Combined Event Union ----
 * Add new events to this union
 */
export type AppEvents = DemoEventSent | UserRegistered;

/**
 * ---- Inngest Event Schemas ----
 */
export const schemas = new EventSchemas().fromUnion<AppEvents>();

/**
 * ---- Extract Event Names ----
 */
export type EventNames = AppEvents["name"];

/**
 * ---- EventName → Full Event ----
 */
export type EventMap = {
  [E in AppEvents as E["name"]]: E;
};

/**
 * ---- EventName → Event Data ----
 */
export type EventDataMap = {
  [E in AppEvents as E["name"]]: E["data"];
};
