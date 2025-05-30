import { Dispatch, SetStateAction, useState } from "react";
import { MonitorCheck, PlusCircle, Users, X } from "lucide-react";

export const menuItem = ["groups", "add", "update", "price"] as const;
export type MenuItem = (typeof menuItem)[number];
export type Props = {
  activeMenuItem: MenuItem;
  setActiveMenuItem: Dispatch<SetStateAction<MenuItem>>;
};
const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div>
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-gray-800 p-2 rounded-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Users size={24} />}
      </button>

      {/* Sidebar - Simplified */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-gray-800 border-r border-gray-700`}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold mb-8 text-gray-100 cursor-pointer">
            name of extension
          </h1>

          {/* Menu items - Simple navigation only */}
          <nav className="space-y-2">
            <button
              className={`flex items-center space-x-2 w-full p-3 rounded-md cursor-pointer ${
                true ? "bg-gray-700 text-blue-400" : "hover:bg-gray-700"
              }`}
            >
              <Users size={20} />
              <span>Groups & Tags</span>
            </button>

            <button
              className={`flex items-center space-x-2 w-full p-3 rounded-md cursor-pointer ${
                false ? "bg-gray-700 text-blue-400" : "hover:bg-gray-700"
              }`}
            >
              <PlusCircle size={20} />
              <span>Add New Group</span>
            </button>
            <button
              className={`flex items-center space-x-2 w-full p-3 rounded-md cursor-pointer ${
                false ? "bg-gray-700 text-blue-400" : "hover:bg-gray-700"
              }`}
            >
              <MonitorCheck size={20} />
              <span>Set Inc & Dec Price</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
