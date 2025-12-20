'use client'
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from 'next-themes'



export default function ThemeToggle() {
  // const [theme, setTheme] = useState("light");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [prefersDark, setPrefersDark] = useState(false);

  function setThemeColor(color) {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', color);
}


  useEffect(() => {
    setMounted(true);
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setPrefersDark(prefers);

    // const savedTheme = localStorage.getItem("theme");
    // const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    // const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    // setTheme(initialTheme);

    // if (initialTheme === "dark") {
    //   document.documentElement.classList.add("dark");
    // } else {
    //   document.documentElement.classList.remove("dark");
    // }
  }, []);

  if (!mounted) {
    return <div className="transition-colors duration-300 ease-in-out flex justify-center items-center text-black  dark:text-white">
      <button
        // onClick={toggleTheme}
        className="relative w-16 h-8 flex items-center rounded-full bg-gray-300 dark:bg-gray-700 p-1 transition-all"
      ></button>
    </div>
  }
  
  // console.log(theme, prefersDark);

  const toggleTheme = () => {
    // console.log(theme);
    const newTheme = (theme === "light") || (theme === "system")  ? "dark" : "light";
    setTheme(newTheme);
    setPrefersDark(newTheme==='dark'?true:false);
    setThemeColor(newTheme === "dark" ? "#0f172acc" : "#ffffffcc");
    // localStorage.setItem("theme", newTheme);

    // if (newTheme === "dark") {
    //   document.documentElement.classList.add("dark");
    // } else {
    //   document.documentElement.classList.remove("dark");
    // }
  };

  // return (
  //   <div className="transition-colors duration-300 ease-in-out">
  //     <button onClick={toggleTheme} className='mode bg-[#e3e3e3] px-3 py-1 text-black dark:bg-neutral-800 dark:text-[#e3e3e3]  rounded-lg'>
  //       {theme === "light" ? "≡ƒîÖ Dark Mode" : "ΓÿÇ∩╕Å Light Mode"}
  //     </button>
  //   </div>
  // );

  return (
    <div className="transition-colors duration-300 ease-in-out flex justify-center items-center text-black dark:text-white">
      {/* Animated Theme Toggle Switch */}
      <button
        onClick={toggleTheme}
        className="relative w-12 h-6 flex items-center rounded-full border dark:border-neutral-600 bg-orange-50 dark:bg-gray-700 p-1 transition-all"
      >
        {/* Sliding Icon */}
        <motion.div
          className="w-4 h-4 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-md"
          initial={{ x: (theme === "dark") || prefersDark ? 24 : 0 }}
          animate={{ x: (theme === "dark") || prefersDark ? 24 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {(theme === "light") || (theme==="system"?!prefersDark:null) ? <Sun size={12} className="text-yellow-500" /> : <Moon size={12} className="text-blue-400" />}
        </motion.div>
      </button>
      {/* <Component {...pageProps} /> */}
    </div>
  );
}
