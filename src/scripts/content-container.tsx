import { useState } from "react";
import Browser from "webextension-polyfill";
import ButtomModal from "./_components/buttom-modal.js";

const ContentContainer = () => {
  const [open, setOpen] = useState(false);
  return (
    <div id="container" className="">
      <button
        onClick={() => setOpen(true)}
        id="extension_init_button"
        aria-label="YourButtonName"
        className="fixed bottom-5 right-5 z-[9999] cursor-pointer w-fit h-fit bg-transparent backdrop-blur-md p-1 rounded-full overflow-hidden"
      >
        <img
          src={Browser.runtime.getURL("icon.png")}
          alt="logo"
          className="h-14"
        />
      </button>

      {/* drawer here... */}
      <ButtomModal open={open} setOpen={setOpen} />
    </div>
  );
};
export default ContentContainer;
