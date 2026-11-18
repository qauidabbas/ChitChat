"use client"
import { ArrowRight, ChevronLeft, Loader2, Lock } from 'lucide-react';
import { useSearchParams, useRouter, redirect } from 'next/navigation';
import axios from "axios";
import Cookies from 'js-cookie';
import React, { useEffect, useRef, useState } from 'react'
import { useAppData, user_service } from '../context/AppContext';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

const VerifyOtp = () => {
  const {isAuth, setIsAuth, setUser, loading:userLoading, fetchChats, fetchUsers  }=useAppData();
  const [loading, setLoading]=useState(false);
  const [otp, setOtp] = useState<string[]>(["","","","","",""]);
  const [error, setError]=useState<string>("");
  const [resendLoading, setResendLoading]=useState(false);
  const [timer, setTimer]=useState(60);
  const inputRefs=useRef<Array<HTMLInputElement | null>>([]);
  const router=useRouter();

  const searchparams=useSearchParams();
  const email: string =searchparams.get("email") || "";
  useEffect(()=>{
    if(timer>0){
      const interval=setInterval(()=>{
        setTimer((prev)=>prev-1);
      }, 1000);
      return ()=>clearInterval(interval);
    }
  }, [timer]);
  const handleInputChange=(index: number, value: string): void=>{
    if(value.length>1) return;
    const newOtp=[...otp];
    newOtp[index]=value;
    setOtp(newOtp);
    setError("");
    if(value && index<5){
      inputRefs.current[index+1]?.focus();
    }
  }
  const handleKeyDown=(index: number, e: React.KeyboardEvent<HTMLElement>):void=>{
    if(e.key==="Backspace" && !otp[index] && index>0)
    {
      inputRefs.current[index-1]?.focus();
    }
  };
  const handlePaste=(e: React.ClipboardEvent<HTMLInputElement>): void=>{
    e.preventDefault();
    const pastedData=e.clipboardData.getData("text");
    const digits=pastedData.replace(/\D/g, "").slice(0,6);
    if(digits.length===6){
      const newOtp=digits.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  }
  const handleSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const otpString=otp.join("");
    if(otpString.length!== 6){
      setError("Please enter all 6 digits");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const {data}=await axios.post(`${user_service}/api/v1/register-verify`, {
        email, otp: otpString
      })
      toast.success(data.message);
      Cookies.set("token", data.token, {
        expires:15, secure:false, path:"/",
      });
      setOtp(["","","","","",""]);
      inputRefs.current[0]?.focus();
      setUser(data.user);
      setIsAuth(true);
      fetchChats();
      fetchUsers();
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Something went wrong");
      } else {
        setError("An unexpected error occurred");
      }
    }finally{
      setLoading(false);
    }
  };
  const handleResendOtp=async()=>{
    setResendLoading(true);
    setError("");
    try {
      const {data}=await axios.post(`${user_service}/api/v1/resend-signup-otp`, {
        email,
      })
      toast.success(data.message);
      setTimer(60);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
      setError(error.response?.data?.message || "Something went wrong");
    } else {
      setError("An unexpected error occurred");}
    }finally{
      setResendLoading(false);
    }
  }
  if(userLoading)return <Loading/>;
  if(isAuth)redirect("/chat");
  return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
            <div className="max-w-md w-full">
                <div className="glass-panel rounded-2xl p-8 transform transition-all duration-500 hover:scale-[1.02]">
                    <div className="text-center mb-8 relative">
                      <button className='absolute top-0 left-0 p-2 text-gray-300 hover:text-white transition-colors' onClick={()=>router.push("/login")}>
                        <ChevronLeft className='w-6 h-6'/>
                      </button>
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg flex items-center justify-center mb-6 transform transition-transform hover:rotate-12">
                            <Lock size={40} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-3 text-glow">
                            Verify Your Email
                        </h1>
                        <p className="text-gray-300 text-lg">We have sent a 6 digit code to</p>
                        <p className="text-indigo-400 font-medium">{email}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-4 text-center">Enter your 6 digit otp here</label>
                                    <div className="flex justify-center gap-3">
                                      {
                                        otp.map((digit, index)=>(
                                          <input key={index} ref={(el: HTMLInputElement | null)=>{
                                            inputRefs.current[index]=el;
                                          }} type="text" maxLength={1} value={digit} onChange={e=>handleInputChange(index, e.target.value)} onKeyDown={e=>handleKeyDown(index,e)} onPaste={index===0? handlePaste: undefined} className='w-12 h-12 text-center text-xl font-bold border-2 border-white/10 rounded-xl bg-white/5 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all'/>
                                        ))
                                      }
                                    </div>
                            {
                              error && <div className="mt-4 bg-red-500/10 border border-red-500/50 rounded-xl p-3 backdrop-blur-md">
                                <p className="text-red-400 text-sm text-center font-medium">{error}</p>
                              </div>
                            }
                            <div className="mt-6">
                              <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/30 hover:from-indigo-500 hover:to-violet-500 transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
                                  {loading?(
                                      <div className="flex items-center justify-center gap-2">
                                          <Loader2 className="w-5 h-5 animate-spin"/>
                                          Verifying...
                                      </div>
                                  ):(<div className="flex items-center justify-center gap-2">
                                      <span>Verify</span>
                                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> 
                                  </div>)}
                              </button>
                            </div>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                      <p className='text-gray-400 text-sm mb-4'>Didn&apos;t recieve the code?</p>
                      {
                        timer>0 ? <p className="text-gray-400 text-sm">Resend code in {timer} seconds</p> : <button className='text-indigo-400 hover:text-indigo-300 font-medium 
                        text-sm transition-colors disabled:opacity-50' disabled={resendLoading} onClick={handleResendOtp}>
                          {resendLoading?"Sending...":"Resend Code"}
                        </button>
                      }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VerifyOtp;