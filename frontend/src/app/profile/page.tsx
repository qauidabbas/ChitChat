"use client"
import React, { useEffect, useState } from 'react'
import { useAppData, user_service } from '../context/AppContext'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Loading from '../components/Loading'
import { ArrowLeft, Save, User, UserCircle } from 'lucide-react'
import axios from 'axios'


const ProfilePage = () => {
    const {user, isAuth, loading, setUser}=useAppData()
    const [isEdit, setIsEdit] = useState(false)
    const [name, setName] = useState<string | undefined>("")

    const router=useRouter()
    const editHandler= ()=>{
        setIsEdit(!isEdit);
        setName(user?.name);
    }
    const submitHandler=async(e:any)=>{
        e.preventDefault()
        const token=Cookies.get("token")
        try {
            const {data}= await axios.post(`${user_service}/api/v1/update/user`, {name}, {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })
            Cookies.set("token", data.token, {
                expires:15,secure:false, path:"/", 
            })
            toast.success(data.message)
            setUser(data.user)
            setIsEdit(false)
        } catch (error: any) {
            toast.error(error.response.data.message)
        }
    }
    useEffect(()=>{
        if(!isAuth && !loading){
            router.push("/login")
        }
    }, [isAuth, router, loading])
    if(loading)return <Loading/> 
  return (
    <div className='min-h-screen p-4 bg-transparent'>
        <div className="max-w-2xl mx-auto pt-8">
            <div className='flex items-center gap-4 mb-8'>
                <button onClick={()=>router.push("/chat")} className='p-3 glass-panel hover:bg-white/10 rounded-xl transition-colors'>
                    <ArrowLeft className='w-5 h-5 text-gray-300'/>
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white text-glow">Profile Settings</h1>
                    <p className='text-indigo-300 mt-1'>
                        Manage your account information
                    </p>
                </div>
            </div>

            <div className='glass-panel rounded-2xl overflow-hidden'>
                <div className="bg-white/5 p-8 border-b border-white/10">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className='w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg transform transition-transform group-hover:rotate-12'>
                                <UserCircle className='w-12 h-12 text-white' />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-[#1e1b4b] shadow-sm"></div>
                        </div>
                        <div className="flex-1">
                            <h2 className='text-2xl font-bold text-white mb-1'>{user?.name || "User"}</h2>
                            <p className='text-indigo-300 text-sm font-medium'>@{user?.username} • Active now</p>
                        </div>
                    </div>
                </div>
                <div className="p-8">
                    <div className='space-y-6'>
                        <div>
                            <label className='block text-sm font-semibold text-gray-300 mb-3'>
                                Display Name
                            </label>
                            {
                                isEdit?<form onSubmit={submitHandler} className='space-y-4'>
                                    <div className="relative">
                                        <input type="text" value={name} onChange={e=>setName(e.target.value)} className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all' />
                                        <User className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400'/>
                                    </div>

                                    <div className="flex gap-3">
                                        <button type='submit' className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg transition-all active:scale-95'>
                                            <Save className='w-4 h-4'/>Save Changes </button>
                                            <button type='button' onClick={editHandler} className='flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all active:scale-95'>Cancel</button>
                                    </div>
                                </form>:<div className='flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10'>
                                    <span className='text-white font-medium text-lg'>{user?.name || "Not set"}</span>
                                    <button onClick={editHandler} className='flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all active:scale-95'>Edit</button>
                                </div>
                            }
                        </div>
                        <div>
                            <label className='block text-sm font-semibold text-gray-300 mb-3'>
                                Username
                            </label>
                            <div className='p-4 bg-white/5 rounded-xl border border-white/10'>
                                <span className='text-gray-400 font-medium text-lg'>@{user?.username}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ProfilePage