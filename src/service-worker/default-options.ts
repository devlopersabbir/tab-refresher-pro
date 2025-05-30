import browser from "webextension-polyfill";

async function defaultStorage() {}
export const defaultOptions = () => {
  browser.runtime.onMessage.addListener((message: any) => {
    if (message.action === "open-options") {
      browser.runtime.openOptionsPage();
    }
  });

  browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") {
      //   await browser.storage.local.set({ price: "0.1" });
      // set all defaul value here
      await defaultStorage();
      await browser.runtime.openOptionsPage();
    }
  });
};
