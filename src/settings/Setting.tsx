import Sidebar from "./_components/sidebar.js";
import Browser from "webextension-polyfill";

const Setting = () => {
  const groups = [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("submit");
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 fixed w-full">
      <Sidebar />
      {/* Main content */}
      <div className="flex-1 ml-0 md:ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-100">
            Update Group Data
          </h1>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 max-h-[80vh] overflow-y-auto scroll-smooth">
            {!groups?.length ? (
              <div className="flex justify-center items-center w-full flex-col">
                <img
                  src={Browser.runtime.getURL("/icon/no-data.svg")}
                  alt="no data"
                  className="w-96"
                />
                <h1 className="text-3xl">No Group Created Yet</h1>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
