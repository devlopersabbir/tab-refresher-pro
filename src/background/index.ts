import Browser, { browserAction, tabs } from "webextension-polyfill";
import { CreateMessageResolver } from "../resolvers";
import { UIStateMessageType } from "../@types";

// ==========================all resolver============================= //
const { addResolver } = CreateMessageResolver<UIStateMessageType>();

// addResolver("ON_PAGE_LOAD", (payload, sender) => {
//   console.log("payload page load", payload);
//   console.log("sender", sender);
// });

// addResolver("INIT_UI", (payload, sender) => {
//   console.log("payload init ui", payload);
//   console.log("sender", sender);
// });
const tabStates = new Map();
const REFRESH_INTERVAL = 20; // 60 seconds default

function startRefresh(payload: { tabId: number; intervalTime: number }) {
  // Clear any existing interval for this tab
  if (tabStates.has(payload.tabId)) {
    clearInterval(tabStates.get(payload.tabId).intervalId);
    clearInterval(tabStates.get(payload.tabId).countdownId);
  }

  let countdown = payload.intervalTime; // like interval time 10 * 1000 => 10000ms

  // update badge immediately
  updateBadge(payload.tabId, countdown);

  const countdownId = setInterval(() => {
    countdown--;
    updateBadge(payload.tabId, countdown);

    if (countdown <= 0) {
      countdown = REFRESH_INTERVAL; // this is the reset value
    }
  }, 1000);
  // need to be store refresh time into local/session storage

  // refresh timer
  const intervalId = setInterval(async () => {
    try {
      await Browser.tabs.reload(payload.tabId);
      countdown = REFRESH_INTERVAL; // reset the countdown after refresh to page
    } catch (err) {
      // tab might to be closed stop the repfresh
      stopRefresh(payload.tabId);
    }
  }, REFRESH_INTERVAL * 1000);

  tabStates.set(payload.tabId, {
    intervalId,
    countdownId,
    countdown,
  });

  // set badge color to the grean and
  Browser.action.setBadgeBackgroundColor({
    color: "#4CAF50",
    tabId: payload.tabId,
  });
}

function stopRefresh(tabId: number) {
  console.log("stop called");
  console.log("tabstate: ", tabStates);
  if (tabStates.has(tabId)) {
    console.log("has...");
    const state = tabStates.get(tabId);
    console.log("fetch the state: ", state);
    clearInterval(state.intervalId);
    clearInterval(state.countdownId);
    tabStates.delete(tabId);
  }

  // clear badge
  Browser.action.setBadgeText({
    text: "",
    tabId,
  });
  // reset badge color
  Browser.action.setBadgeBackgroundColor({
    color: "#666666",
    tabId,
  });
}

function updateBadge(tabId: number, countdown: number) {
  Browser.action.setBadgeText({
    text: countdown.toString(),
    tabId,
  });
}
Browser.tabs.onRemoved.addListener((tabId: number, removeInfo) => {
  console.log("remove info: ", removeInfo);
  if (tabStates.has(tabId)) {
    stopRefresh(tabId);
  }
});

Browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // If tab is loading and we have an active refresh, reset the countdown
  console.log("tab onupdate info: ", changeInfo);
});

addResolver("TIMER_APPLY", (payload, sender) => {
  if (tabStates.has(payload.tabId)) {
    stopRefresh(payload.tabId);
  } else {
    // start refresing this tab
    startRefresh(payload);
  }
});

Browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "stop") {
    console.log("lemme stop: ", message);
    stopRefresh(message.action.tabId);
  }
});
