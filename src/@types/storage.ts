import { TTab } from "./tab";

export type RefresherState = {
  type: "TAB_REFRESH";
  payload: {
    tabId: string;
    tab: TTab;
  };
};
