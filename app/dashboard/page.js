'use client'
// import IndiDashboard from '@/components/Dashboard/indi/IndiDashboard'
// import AdminDashboard from '@/components/Dashboard/org/AdminDashboard'
// import StudentDashboard from '@/components/Dashboard/org/StudentDashboard'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, lazy, useCallback } from 'react'
import Loading from '@/components/Loading'
import dynamic from 'next/dynamic'

const IndiDashboard = lazy(()=> import('@/components/Dashboard/indi/IndiDashboard'));
const AdminDashboard = dynamic(()=> import('@/components/Dashboard/org/AdminDashboard'),{
  loading: ()=> <Loading />
});
const StudentDashboard = dynamic(()=>import('@/components/Dashboard/org/StudentDashboard'),{
  loading: ()=> <Loading />
})


const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedDashboard, setSelectedDashboard] = useState(() => {
    // Get the initial state from local storage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedDashboard') || '';
    }
    return '';
  });

  const resetDash = useCallback(() => {
    localStorage.removeItem('selectedDashboard');
    setSelectedDashboard('');
  }, []);

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (!session) {
      router.replace("/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    // Save the selected dashboard to local storage
    if (selectedDashboard) {
      localStorage.setItem('selectedDashboard', selectedDashboard);
    }
  }, [selectedDashboard]);

  if (status == 'loading' || !session) {
    return (
      <div className="flex justify-center items-center h-[90.7vh] bg-gray-50 dark:bg-transparent">
        
            {status === 'loading' ? (
              <Loading />
            ) : (
              <Loading content="Redirecting to login..." />
            )}
      </div>
    );
  }


  if (session?.user?.user_type.length === 1) {
    let userType = session?.user?.user_type[0]?.type;
    let userRights = session?.user?.user_type[0]?.rights;
    if (userType === 'Individual') {
      return <IndiDashboard resetDash={resetDash} />
    } else if (userType === 'Organization') {
      return userRights === 'admin' ? <AdminDashboard resetDash={resetDash} /> : <StudentDashboard />
    }
  }

  if (session?.user?.user_type.length === 2) {
    let userRights = session?.user?.user_type.find((type) => type.type === "Organization")?.rights;
    if (selectedDashboard === 'Individual') {
      return <IndiDashboard resetDash={resetDash} />;
    } else if (selectedDashboard === 'Organization') {
      let userRights = session?.user?.user_type.find((type) => type.type === "Organization")?.rights;
      return <AdminDashboard resetDash={resetDash} rights={userRights} />;
    }
    return (
      <div className='w-full h-[90.7vh] max-h-full   px-4 flex items-center justify-center'>
        <div className='w-full md:w-3/4 lg:w-1/2 2xl:max-w-[40%] rounded-lg flex flex-col p-6 sm:p-10 gap-4 md:gap-6 bg-white dark:bg-slate-700 shadow-md dark:shadow-slate-900 dark:border dark:border-slate-600'>
          <h2 className='text-3xl'><span className='text-[#FF5F1F] font-semibold'>L</span>ogin to...</h2>
          <div className='flex flex-col sm:flex-row gap-2 sm:gap-4 w-full'>
            <button onClick={() => setSelectedDashboard('Individual')} className='px-6 py-2 w-full sm:w-1/2 bg-[#FF4c00] hover:bg-[#e64400] text-white rounded'>
              Individual Dashboard
            </button>
            <button onClick={() => setSelectedDashboard('Organization')} className='px-6 py-2 w-full sm:w-1/2 bg-[#FF4c00] hover:bg-[#e64400] text-white rounded'>
              Organization Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }


  return null;
}

export default Dashboard;
