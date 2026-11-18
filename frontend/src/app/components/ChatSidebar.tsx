import React, { useState, useEffect } from 'react'
import { User, user_service } from '../context/AppContext';
import { CornerDownRight, CornerUpLeft, LogOut, MessageCircle, Search, UserCircle, X, Users, UserPlus, Check, XCircle } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

interface ChatSideBarProps{
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean)=> void;
    showAllUsers: boolean;
    setShowAllUsers: (show: boolean | ((prev: boolean)=>boolean))=>void;
    users: User[] | null;
    loggedInUser: User| null;
    chats: any[] | null;
    selectedUser: string | null;
    setSelectedUser: (userId: string| null)=>void;
    handleLogout: ()=>void;
    createChat:(user: User)=>void;
    onlineUsers: string[];
}

const ChatSideBar = ({sidebarOpen,setSidebarOpen, loggedInUser,chats, selectedUser,handleLogout, setSelectedUser, createChat, onlineUsers}:ChatSideBarProps) => {
    const [searchQuery, setSearchQuery]=useState("");
    const [activeTab, setActiveTab] = useState<"chats" | "contacts" | "requests">("chats");
    const [contacts, setContacts] = useState<User[]>([]);
    const [pendingRequests, setPendingRequests] = useState<User[]>([]);
    const [searchedUser, setSearchedUser] = useState<User | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);

    const fetchContactsAndRequests = async () => {
        try {
            const token = Cookies.get("token");
            if (!token) return;
            const [contactsRes, requestsRes] = await Promise.all([
                axios.get(`${user_service}/api/v1/contacts`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${user_service}/api/v1/requests/pending`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setContacts(contactsRes.data);
            setPendingRequests(requestsRes.data);
        } catch (error) {
            console.error("Failed to fetch contacts/requests", error);
        }
    };

    useEffect(() => {
        fetchContactsAndRequests();
        // Setup a basic polling interval for requests to simulate real-time
        const interval = setInterval(fetchContactsAndRequests, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearchLoading(true);
        try {
            const token = Cookies.get("token");
            const { data } = await axios.get(`${user_service}/api/v1/search/username/${searchQuery.replace('@','')}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSearchedUser(data);
        } catch (error) {
            setSearchedUser(null);
            toast.error("User not found");
        } finally {
            setSearchLoading(false);
        }
    };

    const sendRequest = async (targetId: string) => {
        try {
            const token = Cookies.get("token");
            await axios.post(`${user_service}/api/v1/request/send`, { targetId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Request sent!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send request");
        }
    };

    const acceptRequest = async (senderId: string) => {
        try {
            const token = Cookies.get("token");
            await axios.post(`${user_service}/api/v1/request/accept`, { senderId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Request accepted!");
            fetchContactsAndRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to accept request");
        }
    };

    const rejectRequest = async (senderId: string) => {
        try {
            const token = Cookies.get("token");
            await axios.post(`${user_service}/api/v1/request/reject`, { senderId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Request rejected");
            fetchContactsAndRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reject request");
        }
    };

  return (
    <aside className={`fixed z-20 sm:static top-0 left-0 h-full w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 transform ${sidebarOpen?"translate-x-0": "-translate-x-full"} sm:translate-x-0 transition-transform duration-300 flex flex-col shadow-2xl`}>
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-black/10">
            <div className="sm:hidden flex justify-end mb-0">
                <button onClick={()=>setSidebarOpen(false)} className='p-2 hover:bg-white/10 rounded-xl transition-colors'><X className='w-5 h-5 text-gray-300'/></button>
            </div>
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg">
                    <MessageCircle className='w-5 h-5 text-white'/>
                </div>
                <h2 className="text-xl font-bold text-white text-glow">ChitChat</h2>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-1 bg-black/20 p-1 rounded-xl border border-white/5">
                <button onClick={() => setActiveTab('chats')} className={`flex-1 py-1.5 px-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'chats' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}>
                    Chats
                </button>
                <button onClick={() => setActiveTab('contacts')} className={`flex-1 py-1.5 px-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'contacts' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}>
                    Contacts
                </button>
                <button onClick={() => setActiveTab('requests')} className={`flex-1 py-1.5 px-2 text-sm font-medium rounded-lg transition-all relative ${activeTab === 'requests' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}>
                    Requests
                    {pendingRequests.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#1e1b4b]"></span>
                    )}
                </button>
            </div>
        </div>

        {/* content */}
        <div className="flex-1 overflow-hidden px-4 py-4">
            {activeTab === 'chats' && (
                chats && chats.length>0?(<div className="space-y-2 overflow-y-auto h-full pb-4 custom-scroll pr-1">
                    {chats.map((chat)=>{
                        const latestMessage=chat.chat.latestMessage;
                        const isSelected= selectedUser===chat.chat._id;
                        const isSentByMe=latestMessage?.sender===loggedInUser?._id;
                        const unseenCount=chat.chat.unseenCount || 0;

                        return <button key={chat.chat._id} onClick={()=>{
                            setSelectedUser(chat.chat._id);
                            setSidebarOpen(false);
                        }} className={`w-full text-left p-4 rounded-xl transition-all group ${isSelected?"bg-gradient-to-r from-indigo-600/40 to-violet-600/40 border border-indigo-500/50 shadow-lg": "border border-transparent hover:border-white/10 hover:bg-white/5"}`}>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform">
                                        <UserCircle className='w-7 h-7 text-indigo-300' />
                                    </div>
                                    {onlineUsers.includes(chat.user._id) && (
                                        <span className='absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#1e1b4b] shadow-sm'/>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`font-semibold truncate transition-colors ${isSelected? "text-white" : "text-gray-200 group-hover:text-indigo-200"}`}>
                                            {chat.user.name}
                                        </span>
                                        {unseenCount>0 && <div className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-sm">
                                            {unseenCount>99 ? "99+": unseenCount}
                                        </div>}
                                    </div>
                                    {latestMessage && <div className="flex items-center gap-1.5">
                                        {isSentByMe?<CornerUpLeft size={14} className='text-indigo-400 shrink-0'/>:<CornerDownRight size={14} className='text-emerald-400 shrink-0'/>}
                                        <span className={`text-sm truncate flex-1 ${unseenCount>0 && !isSentByMe ? 'text-white font-medium' : 'text-gray-400'}`}>{latestMessage.text}</span>
                                    </div>}
                                </div>
                            </div>
                        </button>
                    })}
                </div>):<div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="p-5 bg-black/20 rounded-2xl mb-4 border border-white/5">
                        <MessageCircle className='w-10 h-10 text-indigo-400/50' />
                    </div>
                    <p className="text-gray-300 font-medium">No Conversations</p>
                    <p className="text-sm text-gray-500 mt-2 max-w-[200px]">Add contacts and start a chat</p>
                </div>
            )}

            {activeTab === 'contacts' && (
                <div className="space-y-4 h-full flex flex-col">
                    <form onSubmit={handleSearch} className="relative group">
                        <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-400 transition-colors'/>
                        <input type="text" placeholder='Search by @username...' className='w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all' value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)}/>
                    </form>
                    
                    <div className="space-y-2 overflow-y-auto h-full pb-4 custom-scroll pr-1">
                        {searchedUser ? (
                            <div className='w-full text-left p-4 rounded-xl border border-white/10 bg-white/5'>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 flex items-center justify-center border border-white/10">
                                            <UserCircle className='w-7 h-7 text-indigo-300'/>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className='font-semibold text-white block'>{searchedUser.name}</span>
                                        <span className='text-xs text-indigo-300'>@{searchedUser.username || searchedUser.name.toLowerCase()}</span>
                                    </div>
                                    {searchedUser._id !== loggedInUser?._id && !contacts.find(c => c._id === searchedUser._id) && (
                                        <button onClick={() => sendRequest(searchedUser._id)} className="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white transition-colors">
                                            <UserPlus className="w-4 h-4"/>
                                        </button>
                                    )}
                                </div>
                                <button onClick={() => {setSearchedUser(null); setSearchQuery("");}} className="mt-3 text-xs text-gray-400 hover:text-white w-full text-center">Clear Search</button>
                            </div>
                        ) : contacts.length > 0 ? (
                            contacts.map((u)=>(
                                <button key={u._id} className='w-full text-left p-4 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all group' onClick={()=>{createChat(u); setActiveTab('chats');}}>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
                                                <UserCircle className='w-7 h-7 text-indigo-300'/>
                                            </div>
                                            {onlineUsers.includes(u._id) && (
                                                <span className='absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#1e1b4b] shadow-sm'/>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className='font-semibold text-white group-hover:text-indigo-300 transition-colors'>{u.name}</span>
                                            <div className='text-xs font-medium mt-0.5 flex items-center gap-1.5'>
                                                <span className={`w-1.5 h-1.5 rounded-full ${onlineUsers.includes(u._id) ? "bg-green-500" : "bg-gray-500"}`}></span>
                                                <span className={onlineUsers.includes(u._id) ? "text-green-400" : "text-gray-500"}>
                                                    {onlineUsers.includes(u._id)?"Online":"Offline"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 mt-10">No contacts yet. Search for a username above!</div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'requests' && (
                <div className="space-y-2 overflow-y-auto h-full pb-4 custom-scroll pr-1">
                    {pendingRequests.length > 0 ? pendingRequests.map(req => (
                        <div key={req._id} className='w-full text-left p-4 rounded-xl border border-white/10 bg-white/5'>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center border border-white/5">
                                        <UserCircle className='w-7 h-7 text-indigo-300'/>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className='font-semibold text-white block'>{req.name}</span>
                                    <span className='text-xs text-gray-400'>@{req.username || req.name.toLowerCase()}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => acceptRequest(req._id)} className="p-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/30 rounded-lg transition-colors">
                                        <Check className="w-4 h-4"/>
                                    </button>
                                    <button onClick={() => rejectRequest(req._id)} className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 rounded-lg transition-colors">
                                        <XCircle className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-gray-400 mt-10">No pending requests</div>
                    )}
                </div>
            )}
        </div>

        {/* footer */}
        <div className="p-4 border-t border-white/10 bg-black/20 space-y-2">
            <Link href={'/profile'} className='flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors group'>
            <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:border-white/10 transition-colors"><UserCircle className='w-4 h-4 text-indigo-300'/></div>
            <span className='font-medium text-gray-300 group-hover:text-white transition-colors'>Profile</span>
            </Link>

            <button onClick={handleLogout} className='w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 transition-colors text-gray-400 hover:text-red-400 group'>
                <div className="p-2 bg-white/5 group-hover:bg-red-500/20 rounded-lg border border-white/5 group-hover:border-red-500/30 transition-colors"><LogOut className='w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors'/></div>
            <span className='font-medium'>Logout</span>
            </button>
        </div>
    </aside>
  )
}

export default ChatSideBar