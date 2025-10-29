"use client"
import { registerUser } from '@/actions/useractions.js';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Regindi = () => {
  const { register, handleSubmit, watch, setError, formState: { errors, isSubmitting } } = useForm();
  const router = useRouter();
  // const searchParams = useSearchParams();

  // console.log(searchParams.get("regType"));

  const [show, setShow] = useState(false);

  const onSubmit = async (data) => {
    // data.regType= searchParams.get("regType");
    data.regType = "Individual";
    data.email = data.email?.toLowerCase();
    // console.log(data);
    let u = await registerUser(data);
    // console.log(u);
    if (u.status == true) {
      toast.success(u.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      })
      toast('Please Login.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      setTimeout(() => {
        router.push("/login");
      }, 3500);
    }
    else {
      toast.error(u.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      })
    }
  }

  const password = watch('password');

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        draggablePercent={60}
        pauseOnHover
        theme="light"
      />
      {/* Same as */}
      {/* <ToastContainer /> */}

      <div className='bg-slate-100 dark:bg-inherit p-6 sm:p-10 w-full min-h-[100vh] max-h-[100vmax] text-neutral-800 dark:text-[#e3e3e3] flex flex-col'>
        <div className="title border-b-2 rounded border-zinc-300 dark:border-slate-600 ">
          <div className='flex justify-between items-center'>
            <div>
              <h1 className="text-3xl font-bold"><span className='text-[#FF4c00]'>S</span>ign Up</h1>
              <p>as <span className='text-[#FF4c00] font-bold'>Individual</span></p>
            </div>
            <button onClick={() => router.back()} className='bg-[#FF4c00] hover:bg-[#e64400] text-white rounded-md w-25 h-9 px-2'>Go back</button>
          </div>
          <hr className='dark:border-neutral-600' />
        </div>
        <div className='w-full h-full flex gap-6 lg:gap-28 justify-start' >
          <form action={handleSubmit(onSubmit)} className='mt-5 md:w-1/2 w-full flex flex-col gap-4 items-center px-2 pl-0 sm:px-5'>
            <div className='w-full'>
              <label className='block mb-1' htmlFor="name">Full Name</label>
              <input className='rounded-md dark:border-slate-700 bg-transparent text-sm w-full border-[1.4px]  hover:border-orange-400 dark:hover:border-orange-500 outline-none border-gray-400 p-2' type="text" {...register("name", { required: { value: true, message: 'Field is required' } })} id='name' placeholder='Your full name' />
              {errors.name && <p className='text-red-500 text-xs ml-2'>{`${errors.name.message}`}</p>}
            </div>
            <div className='w-full'>
              <label className='block mb-1' htmlFor="email">Email address</label>
              <input className='rounded-md dark:border-slate-700 bg-transparent text-sm w-full border-[1.4px]  hover:border-orange-400 dark:hover:border-orange-500 outline-none border-gray-400 p-2' type="email" {...register("email", { required: { value: true, message: 'Field is required' } })} id='email' placeholder='Enter your email address' />
              {errors.email && <p className='text-red-500 text-xs ml-2'>{`${errors.email.message}`}</p>}
            </div>
            <div className='w-full'>
              <label className='block mb-1' htmlFor="phone">Phone</label>
              <input className='rounded-md dark:border-slate-700 bg-transparent text-sm w-full border-[1.4px]  hover:border-orange-400 dark:hover:border-orange-500 outline-none border-gray-400 p-2' type="number" {...register("phone", {
                validate: (value) =>
                  (value.length == 10 || value.length == 0) || "Invalid phone no",
              })} id='phone' placeholder='Enter your phone no' />
              {errors.phone && <p className='text-red-500 text-xs ml-2'>{`${errors.phone.message}`}</p>}
            </div>
            <div className='w-full flex sm:flex-row flex-col gap-4 justify-between'>
              <div className='w-full'>
                <label className='block mb-1' htmlFor="password">Password</label>
                <div className='relative'>
                  <input className='rounded-md dark:border-slate-700 bg-transparent text-sm w-full border-[1.4px]  hover:border-orange-400 dark:hover:border-orange-500 outline-none border-gray-400 p-2 pr-9 ' type={show?"text":"password"} {...register("password", { required: { value: true, message: 'Field is required' }, minLength: { value: 8, message: "Password should contain at least 8 characters." }, maxLength: { value: 18, message: "Password should not contain more than 18 characters." } })} id='password' placeholder='Enter password' />
                  <div onClick={() => { setShow(!show) }} className='absolute right-0 rounded-r-md bg-transparent flex items-center justify-center -translate-y-[98%] w-fit p-2 cursor-pointer'>
                    {show !== true ?
                      (<svg className="eye-close" width="22px" height="22px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g strokeWidth="0"></g><g strokeLinecap="round" strokeLinejoin="round"></g><g > <path d="M4 10C4 10 5.6 15 12 15M12 15C18.4 15 20 10 20 10M12 15V18M18 17L16 14.5M6 17L8 14.5" className='dark:stroke-gray-300' stroke="#464455" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>) : (
                        <svg className="eye-open" width="22px" height="22px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g strokeWidth="0"></g><g strokeLinecap="round" strokeLinejoin="round"></g><g > <path d="M4 12C4 12 5.6 7 12 7M12 7C18.4 7 20 12 20 12M12 7V4M18 5L16 7.5M6 5L8 7.5M15 13C15 14.6569 13.6569 16 12 16C10.3431 16 9 14.6569 9 13C9 11.3431 10.3431 10 12 10C13.6569 10 15 11.3431 15 13Z" className='dark:stroke-gray-300' stroke="#464455" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>)
                    }
                  </div>
                </div>
                {errors.password && <p className='text-red-500 text-xs ml-2'>{`${errors.password.message}`}</p>}
              </div>
              <div className='w-full'>
                <label className='block mb-1' htmlFor="confirmPassword">Confirm Password</label>
                <input className='rounded-md dark:border-slate-700 bg-transparent text-sm w-full border-[1.4px]  hover:border-orange-400 dark:hover:border-orange-500 outline-none border-gray-400 p-2' type="text" {...register("confirmPassword", {
                  required: { value: true, message: 'Field is required' }, validate: (value) =>
                    value === password || "The passwords do not match",
                })} id='confirmPassword' placeholder='Re enter password' />
                {errors.confirmPassword && <p className='text-red-500 text-xs ml-2'>{`${errors.confirmPassword.message}`}</p>}
              </div>
            </div>
            <div className='w-full'>
              <button disabled={isSubmitting} className='bg-[#FF4c00] text-lg w-full h-10 rounded-md text-white font-semibold border-[1.4px] border-[#FF5F1F] disabled:bg-opacity-80 disabled:cursor-not-allowed'>{isSubmitting ? "Submitting..." : "Submit"} </button>
            </div>
          </form>
          <div className='hidden md:w-1/2 md:flex items-start text-white justify-center pt-12  pr-5 lg:pr-16 
          '>
            <div className='bg-[#FF5F1F] intro w-full min-h-[40%] rounded-lg'>
              <div className='p-6'>
                <h2 className='text-2xl font-bold mb-4'>Welcome to QuizHub!</h2>
                <p className='text-sm'>
                  Join our community and unlock access to exciting quizzes, challenges, and learning opportunities.
                  Signing up as an individual allows you to track your progress, compete with others, and enhance your knowledge.
                </p>
                <p className='text-sm mt-2'>
                  Fill out the form to get started and become a part of our growing community today!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Regindi
