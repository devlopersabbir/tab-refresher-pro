import Browser from "webextension-polyfill";
import { RequestType } from "../@types";

export function CreateMessageResolver<T extends RequestType>() {
  const resolvers: Record<string, (payload: unknown, sender: any) => unknown> =
    {};
  // @ts-ignore
  Browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("message: ", message);
    if (resolvers[message.type]) {
      const response = resolvers[message.type](message.payload, sender);
      if (!response) return false;

      if (response instanceof Promise) {
        response.then(sendResponse);
        return true;
      } else {
        // @ts-ignore
        sendResponse(response);
        return false;
      }
    } else {
      console.log("empty message type");
    }
  });

  const addResolver = <M extends T["type"]>(
    type: M,
    resolver: (
      payload: Extract<T, { type: M }>["payload"],
      sender: any
    ) => unknown
  ) => {
    resolvers[type] = resolver;
  };

  const removeResolver = (type: string) => delete resolvers[type];

  return { addResolver, removeResolver };
}
