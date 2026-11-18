"use client"
import axios from "axios";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import React, { useState } from "react"
import { useAppData, user_service } from "../context/AppContext";
import Loading from "../components/Loading";
import toast from "react-hot-toast";
import Link from "next/link";

const LoginPage=()=>{
    const {isAuth, loading: userLoading, setUser, setIsAuth}=useAppData();
    const [email, setEmail]=useState<string>("");
    const [password, setPassword]=useState<string>("");
    const [loading, setLoading]=useState<boolean>(false);
    const router=useRouter();

    const handleSubmit=async(e:React.FormEvent<HTMLElement>): Promise<void>=>{
        e.preventDefault();
        setLoading(true);

        try {
            const {data}=await axios.post(`${user_service}/api/v1/login`, {
                email,
                password
            });

            toast.success(data.message);
            import("js-cookie").then((Cookies) => {
                Cookies.default.set("token", data.token, { expires: 15, secure: false, path: "/" });
            });
            setUser(data.user);
            setIsAuth(true);
            router.push(`/chat`);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
            toast.error(error.response?.data?.message ?? "Something went wrong");
        } else {
            toast.error("An unexpected error occurred.");
        }
        }finally{
            setLoading(false);
        }
    }
    if(userLoading) return <Loading/>
    if(isAuth) return redirect("/chat");
    return <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
            <div className="max-w-md w-full">
                <div className="glass-panel rounded-2xl p-8 transform transition-all duration-500 hover:scale-[1.02]">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg flex items-center justify-center mb-6 transform transition-transform hover:rotate-12">
                            <Mail size={40} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-3 text-glow">
                            Welcome To ChitChat
                        </h1>
                        <p className="text-gray-300 text-lg">Enter your email to continue your journey</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                            <input type="email" id="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="Enter Your Email address" required/>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <input type="password" id="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="Enter Your Password" required/>
                        </div>
                        <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/30 hover:from-indigo-500 hover:to-violet-500 transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
                            {loading?(
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin"/>
                                    Logging in...
                                </div>
                            ):(<div className="flex items-center justify-center gap-2">
                                <span>Log In</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> 
                            </div>)}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Don't have an account?{" "}
                            <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>;
};
export default LoginPage;