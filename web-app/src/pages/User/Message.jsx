import React, { useState } from "react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";

const Message = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Message");
  const messages = [
    {
      id: 1,
      name: "Themesflat",
      avatar: "https://i.pravatar.cc/150?img=1",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean scelerisque vulputate tincidunt. Maecenas lorem sapien",
      time: "3 days ago",
    },
    {
      id: 2,
      name: "ThemeMu",
      avatar: "https://i.pravatar.cc/150?img=2",
      message:
        "Nullam lacinia lorem id sapien suscipit, vitae pellentesque metus maximus. Duis eu mollis dolor. Proin faucibus eu lectus a eleifend",
      time: "3 days ago",
    },
    {
      id: 3,
      name: "Cameron Williamson",
      avatar: "https://i.pravatar.cc/150?img=3",
      message: "In consequat lacus augue, a vestibulum est aliquam non",
      time: "3 days ago",
    },
    {
      id: 4,
      name: "Esther Howard",
      avatar: "https://i.pravatar.cc/150?img=4",
      message:
        "Cras congue in justo vel dapibus. Praesent euismod, lectus et aliquam pretium",
      time: "3 days ago",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-8 w-full">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-semibold text-gray-900 mb-8">
              Message
            </h1>

            <div className="bg-white rounded-lg shadow-sm">
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-4 p-6 hover:bg-gray-50 transition-colors ${
                    index !== messages.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <img
                    src={msg.avatar}
                    alt={msg.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-medium text-gray-900">
                        {msg.name}
                      </h3>
                      <span className="text-sm text-gray-400 flex-shrink-0">
                        {msg.time}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Message;
