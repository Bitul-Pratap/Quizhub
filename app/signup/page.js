"use client"
import React, { useState } from 'react'
import Link from 'next/link';

const Regtype = () => {
    const [regType, setRegType] = useState("Organization");
    const [loading, setLoading] = useState(false);
    const handleChange = (e) => {
        setRegType(e.target.value)
        // console.log(regType);
    }
    return (
        <>
            <div className='flex justify-center h-full min-h-screen bg-slate-100 dark:bg-inherit items-center text-neutral-800 dark:text-[#e3e3e3]  py-4'>
                <div className='lg:w-2/3 2xl:max-w-[60%] min-w-[50%] flex lg:flex-row flex-col-reverse bg-[#FF5F1F] shadow-md dark:shadow-slate-950 shadow-neutral-400 rounded  md:min-h-[60vh]'>
                    <div className="lg:w-1/2 dark:border dark:border-slate-700 bg-zinc-100 dark:bg-slate-800 rounded flex items-center rounded-tl-3xl lg:rounded-tl rounded-tr-3xl lg:rounded-br-3xl ">
                        <form className='w-full flex flex-col justify-center gap-4 p-10 px-8 sm:px-16'>
                            <h2 className='text-3xl font-bold'>
                                <span className='text-[#FF4c00]'>R</span>egister as...
                            </h2>
                            <select onChange={handleChange} name="reg_type" id="res_type" className='rounded-lg cursor-pointer dark:border-slate-600 bg-transparent w-full border-[1.4px]  focus:border-orange-400 outline-none border-gray-400 p-2 dark:bg-slate-700'>
                                <option value="Organization">Organization</option>
                                <option value="Individual">Individual</option>
                            </select>
                            <Link href={{
                                pathname: regType === 'Organization' ? "/signup/regorg" : "/signup/regindi",
                                // query: {regType: regType},
                            }}>
                                <button onClick={() => setLoading(true)} className={`bg-[#FF4c00] w-full h-10 rounded-lg text-white font-bold border-[1.4px] border-[#FF5F1F] ${loading ? "bg-opacity-80 cursor-not-allowed" : "hover:bg-[#e64400]"}`}>{loading ? "Submitting..." : "Submit"}</button>
                            </Link>
                        </form>
                    </div>
                    <div className="lg:w-1/2 bg-[#FF5F1F] rounded text-white flex  p-10 px-8 sm:px-16">
                        {regType === "Organization" &&
                            <div className='w-full flex flex-col gap-4 items-center'>
                                <h3 className='text-2xl font-bold'>Organization</h3>
                                <ul className='list-disc'>
                                    <li>You can have multiple admins.</li>
                                    <li>Moniter all fields data.</li>
                                </ul>
                                <p className='text-neutral-900'>Suitable for group of users/ institute.</p>
                            </div>}
                        {regType === 'Individual' &&
                            <div className='w-full flex flex-col gap-4 items-center'>
                                <h3 className='text-2xl font-bold'>Individual</h3>
                                <ul className='list-disc'>
                                    <li>Only one admin.</li>
                                    <li>Monitering is available.</li>
                                </ul>
                                <p className='text-neutral-900'>Suitable for single user(teacher).</p>
                            </div>}
                    </div>
                </div>

            </div>
        </>
    )
}

export default Regtype
