import { useEffect, useState } from "react";
import Browser from "webextension-polyfill";
import {
  sendRequestToActiveTab,
  sendRequestToExtension,
} from "../plugin/tabPlugin";
import { UIStateMessageType } from "../@types";

const App = () => {
  const [interval, setInterval] = useState<number>(0);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleApply = async () => {
    setIsLoading(true);
    const [tabs] = await Browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs && tabs.id) {
      const res = await sendRequestToExtension<UIStateMessageType>({
        type: "TIMER_APPLY",
        payload: {
          tabId: tabs?.id,
          intervalTime: interval,
        },
      });
      console.log("res: ", res);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    sendRequestToExtension<UIStateMessageType>({
      type: "INIT_UI",
      payload: {},
    });
  }, []);
  return (
    <div className="w-64 p-4 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
      <h1 className="text-xl font-bold mb-4">Tab Refresher</h1>

      <div className="mb-4">
        <label htmlFor="interval" className="block mb-2 text-sm font-medium">
          Refresh Interval (seconds)
        </label>
        <input
          type="number"
          id="interval"
          value={interval}
          onChange={(e) => {
            const intervalTime = e.target.value;
            setInterval(+intervalTime); // Update interval state
            console.log(+intervalTime);
          }}
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="1"
        />
      </div>

      {/* <div className="flex items-center mb-4">
        <label htmlFor="toggle" className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              id="toggle"
              className="sr-only"
              checked={isEnabled}
              onChange={() => setIsEnabled(!isEnabled)}
            />
            <div
              className={`w-10 h-6 bg-gray-300 rounded-full shadow-inner transition-colors duration-200 ${
                isEnabled ? "bg-blue-500" : ""
              }`}
            ></div>
            <div
              className={`absolute w-4 h-4 bg-white rounded-full shadow inset-y-1 left-1 transition-transform ${
                isEnabled ? "transform translate-x-full" : ""
              }`}
            ></div>
          </div>
          <div className="ml-3 text-sm font-medium">
            {isEnabled ? "Enabled" : "Disabled"}
          </div>
        </label>
      </div> */}

      <div className="flex flex-col justify-between">
        <button
          onClick={handleApply}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading ? "Applying..." : "Apply Settings"}
        </button>
        <button
          onClick={async () => {
            const [tabs] = await Browser.tabs.query({
              active: true,
              currentWindow: true,
            });

            const tabId = tabs.id;
            Browser.runtime.sendMessage({ action: "stop", tabId });
          }}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Stop
        </button>
      </div>
    </div>
  );
};
export default App;
