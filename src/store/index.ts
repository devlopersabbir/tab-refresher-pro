import Browser from "webextension-polyfill";
import { create } from "zustand";
import { RefresherState } from "../@types/storage";

const useRefresher = create((set, get) => {
  // listen message
  Browser.runtime.onMessage.addListener((message: RefresherState) => {
    if (message.type === "TAB_REFRESH") {
      // do something
    }
  });
});
