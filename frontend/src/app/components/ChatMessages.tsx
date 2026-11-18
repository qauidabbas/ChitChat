import React, { useEffect, useMemo, useRef } from 'react'
import { Message } from '../chat/page';
import { User } from '../context/AppContext';
import moment from 'moment';
import { Check, CheckCheck } from 'lucide-react';

interface ChatMessagesProps{
    selectedUser: string | null;
    messages: Message[] | null;
    loggedInUser:User | null;
}
const ChatMessages = ({selectedUser,messages, loggedInUser}: ChatMessagesProps) => {
    const bottomRef=useRef<HTMLDivElement>(null);
    //seen feature
    const uniqueMessages=useMemo(()=>{
        if(!messages)return [];
        const seen=new Set();
        return messages.filter((message)=>{
            if(seen.has(message._id)){
                return false;
            }
            seen.add(message._id);
            return true;
        })
    }, [messages]);
    useEffect(()=>{
        bottomRef.current?.scrollIntoView({behavior: "smooth"})
    }, [selectedUser, uniqueMessages])
  return (
    <div className='flex-1 overflow-hidden relative'>
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/5 to-black/20 pointer-events-none z-0"></div>
        <div className="h-full max-h-[calc(100vh - 215px)] overflow-y-auto p-4 sm:p-6 space-y-4 custom-scroll relative z-10">
            {
                !selectedUser? <div className="flex flex-col items-center justify-center h-full opacity-50">
                    <p className="text-gray-300 font-medium mt-4 text-lg">
                        Select a user to start chatting
                    </p>
                </div>:(<>
                    {
                        uniqueMessages.map((e,i)=>{
                            const isSentByMe=e.sender===loggedInUser?._id;
                            const uniqueKey=`${e._id}-${i}`

                            return (
                                <div className={`flex flex-col gap-1.5 mt-2 ${isSentByMe? "items-end": "items-start"}`} key={uniqueKey}>
                                    <div className={`p-4 max-w-sm sm:max-w-md shadow-md backdrop-blur-md ${isSentByMe?"bg-gradient-to-br from-indigo-600/90 to-violet-600/90 text-white rounded-2xl rounded-tr-sm border border-indigo-500/30":"bg-white/10 text-gray-100 rounded-2xl rounded-tl-sm border border-white/5"}`}>
                                        {
                                            e.messageType==='image' && e.image && (
                                                <div className="relative group rounded-xl overflow-hidden mb-2">
                                                    <img src={e.image.url} alt="shared image" className='max-w-full h-auto object-cover transform transition-transform group-hover:scale-105 duration-500'/>
                                                </div>
                                            )
                                        }
                                        {
                                            e.text && <p className='leading-relaxed'>{e.text}</p>
                                        }
                                    </div>

                                    <div className={`flex items-center gap-1.5 text-[11px] font-medium text-gray-400 ${
                                        isSentByMe?"pr-1 flex-row-reverse": "pl-1"
                                        }`}>
                                            <span>{moment(e.createdAt).format("hh:mm A · MMM D")}</span>

                                            {
                                                isSentByMe && <div className="flex items-center">
                                                    {
                                                        e.seen? <div className="flex items-center gap-1 text-indigo-400">
                                                            <CheckCheck className='w-3.5 h-3.5'/>
                                                            {
                                                                e.seenAt && <span className="opacity-75">{moment(e.seenAt).format("hh:mm A")}</span>
                                                            }
                                                        </div>:<Check className='w-3.5 h-3.5 text-gray-500'/>
                                                    }
                                                </div>
                                            }
                                        </div>
                                </div>
                            )
                        })
                    }
                    <div ref={bottomRef}/>
                </>) 
            }
        </div>
    </div>
  )
}

export default ChatMessages