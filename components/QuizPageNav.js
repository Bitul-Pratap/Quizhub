"use client"
import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

const QuizPageNav = () => {
    // const [scrolled, setScrolled] = useState(false);

    // const handleScroll = useCallback(() => {
    //     setScrolled(window.scrollY > 50);
    // }, []);


    // useEffect(() => {
    //     window.addEventListener("scroll", handleScroll);
    //     return () => window.removeEventListener("scroll", handleScroll);
    // }, [handleScroll]);

    return (
        <>
            <header className={`border-b bg-white/80 dark:bg-slate-900/80  transition-all duration-300 ease-in-out  will-change-auto mx-auto
            ${0
                    ? "bg-white/50  dark:bg-slate-900/50 top-[1%] sm:top-[2%] shadow-md  w-full sm:w-[60%]  md:w-[67%] lg:w-[50%] rounded-full dark:border-b-2 dark:border-b-slate-600 backdrop-blur-md"
                    : " rounded-none dark:border-b border-slate-200 dark:border-slate-700 w-full "
                }
            `}>
                <div className={`container dark:text-white flex mx-auto justify-center gap-6 sm:gap-14 items-center px-6 py-3   `}>
                    <div className="logo font-bold">
                        <Link href={"/"} className='flex items-center space-x-2' >
                            <div className='flex items-center'>
                                <span className='text-3xl text-[#FF5F1F] mr-[2px]'>Q</span>
                                <span className='text-xl'>uizhub</span>
                            </div>
                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium rounded-full">v2.0</span>
                        </Link>
                    </div>
                    <div className={`menu  bg-opacity-60 transition-all duration-300 ${0 ? "bg-slate-400 dark:bg-slate-500 h-7 w-[3px]" : "bg-orange-300 h-[6px] w-[6px]"} rounded`}></div>
                    <div className='flex items-center space-x-2 sm:space-x-6'>
                        <ThemeToggle />
                    </div>
                </div>
            </header>
        </>
    )
}

export default QuizPageNav;