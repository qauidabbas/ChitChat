import { Loader2, Paperclip, Send, X } from 'lucide-react';
import React, {useState} from 'react'

interface MessageInputProps{
    selectedUser: string | null;
    message: string;
    setMessage: (message:string)=>void;
    handleMessageSend: (e: any, imageFile?:File | null)=>void;
}
const MessageInput = ({selectedUser, message, setMessage, handleMessageSend}: MessageInputProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading]=useState(false);
  const handleSubmit=async(e: any)=>{
    e.preventDefault();
    if(!message.trim() && !imageFile)return;
    setIsUploading(true);
    await handleMessageSend(e, imageFile);
    setImageFile(null);
    setIsUploading(false);
  }
    if(!selectedUser)return null;
    return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-3 p-4 sm:p-6 backdrop-blur-md bg-black/20 border-t border-white/10 mt-auto'>
      {
        imageFile && <div className="relative w-fit">
          <img src={URL.createObjectURL(imageFile)} alt="preview" className='w-24 h-24 object-cover rounded-xl border border-white/20 shadow-lg'/>
          <button type='button' className='absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 shadow-lg transform transition-transform hover:scale-110' onClick={()=>setImageFile(null)}>
            <X className='w-4 h-4 text-white'/>
          </button>
        </div>
      }

      <div className="flex items-center gap-3">
        <label className='cursor-pointer bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-colors border border-transparent hover:border-white/10 group shadow-sm'>
          <Paperclip size={20} className='text-gray-300 group-hover:text-indigo-300 transition-colors'/>
          <input type="file" accept="image/*" className='hidden' onChange={e=>{
            const file=e.target.files?.[0];
            if(file && file.type.startsWith("image/")){
              setImageFile(file);
            }
          }}/>
        </label>
        <input type="text" className='flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner' placeholder={imageFile?"Add a caption...": "Type a message..."} value={message} onChange={(e)=>setMessage(e.target.value)}/>

        <button type='submit' disabled={(!imageFile && !message) || isUploading} className='bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 p-3 rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95 flex items-center justify-center min-w-[48px] disabled:opacity-50 disabled:cursor-not-allowed group text-white border border-indigo-500/30'>
          {
            isUploading? <Loader2 className='w-5 h-5 animate-spin'/>: <Send className='w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform'/>
          }
        </button>
      </div>
    </form>
  )
}

export default MessageInput