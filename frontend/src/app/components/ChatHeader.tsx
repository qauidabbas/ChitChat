import { Menu, UserCircle } from "lucide-react";
import React from "react";
import { User } from "../context/AppContext";

interface ChatHeaderProps {
  user: User | null;
  setSidebarOpen: (open: boolean) => void;
  isTyping: boolean;
  onlineUsers: string[];
}

const ChatHeader = ({ user, setSidebarOpen, isTyping , onlineUsers}: ChatHeaderProps) => {
  const isOnlineUser=user && onlineUsers.includes(user._id)
  return (
    <>
      {/* Mobile menu toggle */}
      <div className="sm:hidden absolute top-4 right-4 z-30">
        <button
          className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5 text-gray-200" />
        </button>
      </div>
      {/* chat header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="relative group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-white/10 flex items-center justify-center transform transition-transform group-hover:scale-105">
                    <UserCircle className="w-8 h-8 text-indigo-300"/>
                </div>
                {/* online user setup */}
                {
                  isOnlineUser && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#1e1b4b] shadow-sm">
                      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
                    </span>
                  )
                }
              </div>
            {/* user info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center mb-1 gap-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-white truncate text-glow">
                        {user.name}
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                  {
                    isTyping?<div className="flex items-center gap-2 text-sm bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 w-fit">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:"0.1s"}}></div>
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:"0.2s"}}></div>
                      </div>
                      <span className="text-indigo-300 font-medium text-xs">
                        typing...
                        </span>
                    </div>:<div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isOnlineUser?"bg-green-500":"bg-gray-500"}`}></div>
                      <span className={`text-sm font-medium ${isOnlineUser?"text-green-400": "text-gray-400"}`}>
                        {isOnlineUser?"Online":"Offline"}
                      </span>
                    </div>
                  }
                </div>
            </div>
            </>
          ) : (
            <div className="flex items-center gap-4 w-full">
                <div className="w-14 h-14 rounded-2xl bg-black/20 border border-white/5 flex items-center justify-center">
                    <UserCircle className="w-8 h-8 text-gray-500"/>
                </div>
                <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-300">
                        Select a conversation
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Choose chat from the sidebar to start messaging
                    </p>
                </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatHeader;
