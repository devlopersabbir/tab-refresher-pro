import {
  ExtensionSettings,
  PopupSnapshot,
  RefreshConfig,
  RefreshJob,
} from "./refresh.js";

export type UIStateMessageType =
  | {
      type: "GET_POPUP_SNAPSHOT";
      payload: {};
    }
  | {
      type: "START_REFRESH";
      payload: {
        tabId: number;
        url?: string;
        title?: string;
        config: RefreshConfig;
      };
    }
  | {
      type: "STOP_REFRESH";
      payload: {
        tabId: number;
      };
    }
  | {
      type: "SAVE_TAB_CONFIG";
      payload: {
        tabId: number;
        url?: string;
        title?: string;
        config: RefreshConfig;
      };
    }
  | {
      type: "REFRESH_ONCE";
      payload: {
        tabId: number;
        hardReload: boolean;
      };
    }
  | {
      type: "SAVE_SETTINGS";
      payload: ExtensionSettings;
    }
  | {
      type: "CLEAR_JOBS";
      payload: {};
    }
  | {
      type: "POPUP_SNAPSHOT";
      payload: PopupSnapshot;
    }
  | {
      type: "JOB_UPDATED";
      payload: RefreshJob;
    }
  | {
      type: "OVERLAY_UPDATE";
      payload: {
        job?: RefreshJob;
        settings: ExtensionSettings;
      };
    };
