"use client"
import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import { useSession, signOut } from 'next-auth/react'
import { User } from 'lucide-react'

const MainNavbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const { status } = useSession();
    const [isLogin, setIsLogin] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };
    const handleScroll = useCallback(() => {
        setScrolled(window.scrollY > 50);
    }, []);


    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        if (status == 'authenticated') setIsLogin(true);
        else setIsLogin(false);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll, status]);

    useEffect(() => {
        if (!dropdownOpen) return;
        const handleClickOutside = (e) => {
            if (
                !e.target.closest('.account-dropdown-btn') &&
                !e.target.closest('.account-dropdown-menu')
            ) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    return (
        <>
            <header className={`border-b bg-white/80 dark:bg-slate-900/80  sticky top-0 z-50 transition-all duration-300 ease-in-out  will-change-auto mx-auto
            ${scrolled
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
                    <div className={`menu  bg-opacity-60 transition-all duration-300 ${scrolled ? "bg-slate-400 dark:bg-slate-500 h-7 w-[3px]" : "bg-orange-300 h-[6px] w-[6px]"} rounded`}></div>
                    <div className='flex items-center space-x-2 sm:space-x-6'>
                        <ThemeToggle />
                        {isLogin ? (
                            <div className="relative">
                                <button
                                    onClick={toggleDropdown}
                                    className='account-dropdown-btn w-fit h-9 p-2 sm:px-4 font-medium rounded-md flex gap-2 sm:gap-4 items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-100'
                                >
                                    <User className='w-4 h-4 text-black dark:text-white' />
                                    <span className='hidden sm:block'>
                                        Account
                                    </span>
                                    <span className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`}>
                                        <div className="w-2 h-2 border-t-[1.5px] border-r-[1.5px] rounded-tr-sm border-black dark:border-white transform rotate-[135deg]"></div>
                                    </span>
                                </button>
                                <div className={`account-dropdown-menu absolute mt-2 right-0 sm:left-0 w-fit md:w-48 transition-all duration-300 overflow-hidden ${dropdownOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"} bg-white dark:bg-slate-800 rounded-md shadow-lg z-20`}>
                                    <Link href="/dashboard">
                                        <div className="block px-4 py-2 rounded-t-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Dashboard</div>
                                    </Link>
                                    <button onClick={signOut} className="block w-full text-left px-4 py-2 rounded-b-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link href={"/login"} className='text-sm text-white dark:text-black  bg-gradient-to-r from-orange-400 to-[#FF5F1F] hover:bg-gradient-to-l h-9 py-2 px-4 rounded-md'>
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </header>
        </>
    )
}

export default MainNavbar
