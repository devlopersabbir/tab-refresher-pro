import { Button } from "../../components/ui/button.js";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../../components/ui/drawer.js";
import React from "react";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
const ButtomModal = ({ open, setOpen }: Props) => {
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent
        className="dark bg-gray-950 text-gray-200"
        aria-description="group selection"
        aria-describedby={"group selection"}
      >
        <DrawerHeader>
          <DrawerTitle>title</DrawerTitle>
          <DrawerDescription>
            You can increment and decrement your price from here...
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 py-2 max-h-[60vh] overflow-y-auto">
          <div className="w-full justify-end items-end">
            <div className="flex flex-row space-x-2 mb-2 justify-end items-end">
              body here...
            </div>
          </div>
        </div>

        <DrawerFooter className="flex flex-row justify-between">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button
            onClick={() => {
              console.log("clicked...");
            }}
          >
            button text
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
export default ButtomModal;
