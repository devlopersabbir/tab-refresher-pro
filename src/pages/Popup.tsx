import { useState } from "react";
import Browser from "webextension-polyfill";

export default function Popup() {
  const [second, setSecond] = useState<number>(0);

  const click = async () => {
    if (second < 2) return;
    try {
      const [tab] = await Browser.tabs.query({
        currentWindow: true,
        active: true,
      });
      if (tab.id) {
        await Browser.runtime.sendMessage({
          tabId: tab.id,
          start: true,
          time: second,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <input
        type="number"
        onChange={(e) => setSecond(Number(e.target.value))}
        placeholder="enter second"
        value={second}
      />
      <button onClick={click}>click me</button>
    </div>
  );
}
