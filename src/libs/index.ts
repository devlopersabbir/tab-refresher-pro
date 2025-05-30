import browser from "webextension-polyfill";
import { Status } from "../utils";

/**
 * @param {Status} status is current extension situations
 * @returns {void}
 */
export const status = (status: Status): void => {
  switch (status) {
    case "OFF":
      browser.action.setBadgeText({ text: "OFF" });
      browser.action.setBadgeTextColor({ color: "red" });
    case "ON":
      browser.action.setBadgeText({ text: "ON" });
      browser.action.setBadgeTextColor({ color: "green" });
  }
};
