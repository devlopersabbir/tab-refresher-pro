import Browser from "webextension-polyfill";
import { RequestType } from "../@types";

export async function sendRequestToExtension<
  RQST extends RequestType,
  RSP = unknown,
>(message: RQST): Promise<RSP> {
  const response = await Browser.runtime.sendMessage(message);
  return response as RSP;
}

export async function sendRequestToTab<RQST extends RequestType, RSP = unknown>(
  tabId: number,
  message: RQST,
): Promise<RSP> {
  const response = await Browser.tabs.sendMessage(tabId, message);
  return response as RSP;
}

export async function sendRequestToActiveTab<
  RQST extends RequestType,
  RSP = unknown,
>(message: RQST): Promise<RSP> {
  const query: Browser.Tabs.QueryQueryInfoType = {
    active: true,
    currentWindow: true,
  };
  const tabs = await Browser.tabs.query(query);

  if (tabs.length === 0) throw new Error("No active tab found!");
  const activeTab = tabs[0];

  const response = await sendRequestToTab(activeTab.id!, message);
  return response as RSP;
}
