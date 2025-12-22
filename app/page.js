
import React from "react";
import Link from "next/link";
import Image from "next/image";
import * as motion from "motion/react-client";
import { ArrowRight, Sparkles } from "lucide-react";
import MainLayout from "@/components/MainLayout";

export const metadata = {
  title: "QuizHub – Online Quiz Creation & Assessment ",
  description: "QuizHub is an online quiz platform to create, share, and manage quizzes with AI-powered question generation, real-time analytics, and secure assessments.",
  keywords: [
    "online quiz platform",
    "quiz creation tool",
    "create quiz online",
    "AI quiz generator",
    "online assessment platform",
    "education quizzes",
    "quiz management system"
  ],
}

export default function Home() {
  return (
    <MainLayout>

      <section id="home" className=" h-[calc(100vh-36px)] min-h-[620px] max-h-screen flex flex-col justify-center items-center text-center relative w-full dark:text-white  bg-orange-50 dark:bg-slate-900 p-10 overflow-hidden" >
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-orange-500/20 to-transparent rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 py-20 lg:py-32 relative">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center max-w-4xl mx-auto flex flex-col items-center  gap-6"
          >
            <div className="inline-flex items-center rounded-full text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 px-4 py-2" ><Sparkles className="w-4 h-4 mr-2" /> Introducing QuizHub v2.0 - Now with AI</div>
            <h1 className="sr-only">
              Online Quiz Creation & Assessment Platform
            </h1>
            <h2 className="font-bold text-5xl lg:text-7xl text-[#FF5F1F] ">
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Quizhub</span>
            </h2>
            <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-400 ">Create, manage and analyse quizzes with the power of AI</p>
            <p className="text-lg text-slate-500 dark:text-slate-500 max-w-2xl mx-auto">Build engaging quizzes in seconds using AI generation, smart file imports, or traditional manual creation. Perfect for educators, trainers, and content creators.</p>
            <div className="mt-4 flex gap-3 justify-center">
              <Link href={'/signup'} className="text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 slideFlSlow transition-all duration-300  h-10 px-4 md:h-11 md:px-8 xl:text-lg py-2 md:py-6 rounded-md flex items-center gap-4 ">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              {/* <button className="bg-white w-20 h-10 px-4 py-2 rounded-lg">btn2</button> */}
            </div>
          </motion.div>
          {/* <div className="min-h-52 w-52 clip-rightTriangle bg-slate-300 dark:bg-opacity-30 absolute bottom-0 right-0 slide-in-right-fast"></div> */}
          {/* <div className="min-h-48 w-48 clip-rightTriangle bg-[#FF5F1F] absolute bottom-0 right-0 slide-in-right-slf"></div> */}
        </div>
      </section>

      {/* Γ£à FEATURES SECTION */}
      <section className="bg-slate-50 flex min-h-fit justify-center items-center h-screen dark:bg-gray-800 -gray-900 dark:text-white py-20 px-10">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl  font-bold text-[#FF5F1F]">Why Choose Quizhub?</h2>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
            A powerful platform for educators, students, and individuals.
          </p>
          <div className="grid lg:grid-cols-3  gap-10 mt-20">
            {[
              { title: "Easy Quiz Creation", desc: "Create quizzes in minutes with an intuitive interface." },
              { title: "Real-time Analytics", desc: "Track progress and gain insights instantly." },
              { title: "Gamification", desc: "Engage learners with badges, rewards, and leaderboards." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="p-6 rounded-lg bg-gray-100 dark:bg-gray-700 shadow-md"
              >
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="h-screen min-h-[620px] bg-orange-50 dark:bg-inherit dark:text-white overflow-hidden py-20 px-10 ">
        <div className="flex flex-col-reverse gap-6 lg:flex-row-reverse mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, transform: 'translateX(80px)' }}
            whileInView={{ opacity: 1, transform: 'translateX(0)' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6 h-1/2 lg:full lg:w-3/5 2xl:w-2/5 mt-10 sm:pl-10">
            <h2 className="font-bold text-4xl md:text-5xl relative rounded-sm w-fit
              after:rounded-b-sm after:content-[' '] after:w-full after:absolute after:left-0 after:bottom-[-1px] after:h-[3px] after:bg-gradient-to-r after:from-[#FF5F1F] after:to-[#ffaf8f]
            ">
              <span className="text-[#FF5F1F]">F</span>or the institute
            </h2>
            <p className="md:text-lg">Manage quizzes for large teams or groups.
              <br />
              Generate aggregated analytics to understand group performance and identify areas for improvement.</p>
          </motion.div>
          <div className="flex relative items-center h-1/2 lg:h-full justify-center lg:w-2/5 2xl:w-3/5 md:mt-10">
            <div className="relative w-full max-w-[480px] lg:max-w-[640px] aspect-[16/10]">
              <div className="w-full rounded-xl rotate-6 shadow-md top-2 left-4 z-0 max-w-[640px] max-h-[400px] absolute bg-white h-full" ></div>
              <div className="w-full rounded-xl -rotate-[5deg] shadow-md z-0 top-2 left-2 max-w-[640px] max-h-[400px] absolute bg-white h-full" ></div>
              <Image src={"/institute-cmp.png"} fill alt="insitute image" className="rounded-xl shadow-xl  z-10 relative" />
            </div>
          </div>
        </div>
      </section>

      <section className="h-screen min-h-[620px] text-[#FF5F1F] dark:bg-gray-800 bg-slate-50 overflow-hidden py-20 px-10">
        <div className="flex flex-col-reverse gap-6 lg:flex-row mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, transform: 'translateX(-80px)' }}
            whileInView={{ opacity: 1, transform: 'translateX(0)' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6 h-1/2 lg:h-full lg:w-3/5 2xl:w-2/5 mt-10 sm:pl-10">
            <h2 className="font-bold text-4xl md:text-5xl rounded-sm w-fit relative
              after:rounded-b-sm after:content-[' '] after:w-full after:absolute after:left-0 after:bottom-[-1px] after:h-[3px] after:bg-gradient-to-r after:to-[#FF5F1F] after:from-[#ffaf8f]
            ">For the individual</h2>
            <p className="md:text-lg dark:text-[#e3e3e3]">Personalize quizzes for self-learning, practice, or small-scale projects.
              <br />
              Track individual performance through detailed analytics.
            </p>
          </motion.div>
          <div className="flex relative items-center h-1/2 lg:h-full justify-center lg:w-2/5 2xl:w-3/5 md:mt-10">
            <div className="relative w-full max-w-[480px] lg:max-w-[640px] aspect-[16/10]">
              <div className="w-full rounded-xl rotate-6 shadow-md top-2 left-4 z-0 max-w-[640px] max-h-[400px] absolute bg-white h-full" ></div>
              <div className="w-full rounded-xl -rotate-[5deg] shadow-md z-0 top-2 left-2 max-w-[640px] max-h-[400px] absolute bg-white h-full" ></div>
              <Image src={"/individual-cmp.png"} fill alt="insitute image" className="rounded-xl shadow-xl  z-10 relative" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="h-2/5 bg-[#FF5F1F] bg-gradient-to-br from-orange-500 to-[#FF5F1F] text-white py-20 px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-3xl mx-auto"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold">Get Started with Quizhub Today</h2>
          <p className="mt-4 md:text-lg">Sign up now and create your first quiz in minutes.</p>
          <Link href="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 bg-white text-[#FF5F1F] px-6 py-3 rounded-lg font-bold text-lg hover:bg-gray-200 transition-all duration-75 ease-out"
            >
              Sign Up for Free
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </MainLayout>
  );
}
