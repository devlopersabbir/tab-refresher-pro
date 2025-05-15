import Browser from "webextension-polyfill";
import { CreateMessageResolver } from "../resolvers";
import { UIStateMessageType } from "../@types";

// ==========================all resolver============================= //
const { addResolver, removeResolver } =
  CreateMessageResolver<UIStateMessageType>();

addResolver("ON_PAGE_LOAD", (payload, sender) => {
  console.log("payload", payload);
  console.log("sender", sender);
});

addResolver("INIT_UI", (payload, sender) => {
  console.log("payload init", payload);
  console.log("sender", sender);
});

addResolver("TIMER_APPLY", (payload, sender) => {
  console.log("payload init", payload);
  console.log("sender", sender);
});
