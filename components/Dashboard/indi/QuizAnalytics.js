'use client'
import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import { fetchQuizInfo, getQuizAnalytics, getUserId } from '@/actions/useractions.js';
import Loading from '@/components/Loading'

// Assuming you have an API to fetch quizzes and analytics
const QuizAnalytics = () => {

  const { data: session } = useSession();

  const [quizzes, setQuizzes] = useState([]); // Store quizzes list
  const [selectedQuiz, setSelectedQuiz] = useState(null); // Store selected quiz
  const [analytics, setAnalytics] = useState(null); // Store quiz analytics
  const [loading, setLoading] = useState(false); // Loading state
  const [refresh, setRefresh] = useState(false);
  const [showAll, setShowAll] = useState(false); // Toggle for leaderboard view

  useEffect(() => {
    // Fetch all quizzes when the component mounts
    const getQuizes = async () => {
      setLoading(true);
      if (session?.user?.email) {
        const userId = await getUserId(session.user.email);
        const quizes = await fetchQuizInfo(userId);
        setQuizzes(quizes);
        // console.log(quizes);
      }
      setLoading(false);
    };

    getQuizes();
  }, []);



  // Fetch analytics data when a quiz is selected
  const fetchAnalytics = async (quizId) => {
    // setLoading(true);
    const analytics = await getQuizAnalytics(quizId);
    // console.log(analytics);
    setAnalytics(analytics);
    // setLoading(false);
  };

  // Handle quiz selection
  const handleQuizSelect = (event) => {
    const quizId = event.target.value;
    setSelectedQuiz(quizId);
    setShowAll(false); // Reset leaderboard view
    if (quizId) {
      fetchAnalytics(quizId); // Fetch analytics for the selected quiz
    } else {
      setAnalytics(null); // Clear analytics if no quiz is selected
    }
  };

  // Toggle leaderboard view
  const toggleShowAll = () => {
    setShowAll((prev) => !prev);
  };

  return (
    <div className="sm:px-3 text-slate-800 dark:text-[#e3e3e3]">
      <h1 className="text-2xl font-bold text-center mb-6">Quiz Analytics</h1>
      <div className="p-4 sm:p-6 rounded bg-stone-200 bg-opacity-70 dark:bg-slate-800 dark:border-slate-700 border border-gray-300">
        {loading ? (<Loading content={"Fetching quiz info..."} />) : (
          <>
            {/* Quiz Selection */}
                  <div className="mb-6 mx-auto w-full sm:w-1/2 relative">
                    <label htmlFor="quizSelect" className="mb-1 block font-medium">Select a Quiz</label>
                    <div className="relative">
                    <select
                      id="quizSelect"
                      onChange={handleQuizSelect}
                      value={selectedQuiz || ""}
                      className=" bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-inherit dark:border-slate-700 text-sm p-2.5 w-full border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#FF5F1f] focus:border-transparent outline-none transition-all duration-300 hover:border-[#FF5F1f] cursor-pointer appearance-none"
                      // onClick={(e) => e.target.classList.toggle('open')}
                    >
                      <option value="">-- Select a Quiz --</option>
                      {quizzes.sort((a,b)=>b.createdAt-a.createdAt).map((quiz) => (
                      <option key={quiz.quizId} value={quiz.quizId}>
                        {quiz.title}  |  {quiz.subject}
                      </option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg
                      className={`w-4 h-4 transition-transform duration-300 ${selectedQuiz ? 'rotate-180' : ''}`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                    </div>
                  </div>
                  </>)}

                {quizzes.length === 0 && !loading && <p className="text-lg text-center dark:text-gray-200 text-gray-700">No quizzes available.</p>}

                <div
                  className={`transition-all duration-500 ${analytics ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                >

                  {/* Analytics Display */}
          {analytics ? (
            <>
              <div className="bg-white dark:bg-slate-900 shadow-md dark:shadow-slate-950 rounded-lg p-3 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-inherit mb-4">{analytics.title} Analytics</h2>

                {/* Quiz info */}

                <div className="mb-6 border-b border-gray-200 dark:border-slate-700 pb-4 flex md:flex-row flex-col justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Subject: {analytics.subject} | Title: {analytics.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Questions: {analytics.leaderboard[0]?.totalQuestions} | Max Marks: {analytics.leaderboard[0]?.maxMarks}
                  </p>

                </div>

                {/* Leaderboard */}
                        <div className="mb-6">
                          <h3 className=" font-semibold text-gray-700 dark:text-gray-300">Leaderboard</h3>
                          {analytics.leaderboard.length > 0 ? (
                          <>
                            <ul className={`mt-2 border will-change-auto border-gray-300 dark:border-slate-700 rounded-lg transition delay-75 duration-200 hover:shadow-[0_3px_6px_-2px_rgb(255,95,31)]  p-2`}
                            >
                            {(showAll
                              ? analytics.leaderboard
                              : analytics.leaderboard.slice(0, 10)
                            ).map((attempt, index) => (
                              <li key={index} className={`flex flex-col sm:flex-row will-change-auto gap-1 sm:gap-0 text-sm justify-between sm:p-2 border-b border-gray-200 dark:border-slate-400 overflow-ellipsis opacity-0 ${index > 9 ? "animate-slide-up" : "animate-slide-in"}`}
                              style={{ animationDelay: `${index * 0.1}s` }} >
                              <div className="flex items-center gap-2 sm:gap-4">
                                <span>{index + 1}. </span><span className="overflow-x-auto">{attempt.userEmail}</span>
                              </div>
                              <span className="text-gray-500 self-end dark:text-gray-400">Score: {attempt.score}/{attempt.maxMarks}{" | "}Correct:{attempt.correctQuestions}/{attempt.totalQuestions}</span>
                              </li>
                            ))}
                            </ul>
                            <div className="mt-4 flex gap-2 sm:gap-4">
                            {analytics.leaderboard.length > 10 && (
                              <button
                              onClick={toggleShowAll}
                              className=" bg-[#FF5F1f] text-white text-sm px-4 py-2 rounded hover:bg-[#E5541C] transition"
                              >
                              {showAll ? "Show Less" : "Show All"}
                              </button>
                            )}
                            <button onClick={() => { setRefresh(true); fetchAnalytics(selectedQuiz).finally(() => setRefresh(false)); }} className=" bg-[#FF5F1f] text-white text-sm px-4 py-2 rounded hover:bg-[#E5541C] transition">
                              {refresh ? "Refreshing..." : "Refresh"}
                            </button>
                            </div>
                          </>
                          ) : (
                          <p>No attempts made yet.</p> // No attempt data available
                          )}
                        </div>

                {/* Total Attempts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 border rounded-lg dark:border-slate-700 bg-zinc-100 dark:bg-slate-800 hover:shadow-md dark:hover:shadow-slate-700 transition-shadow">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Total Attempts</h3>
                    <p className="text-sm">{analytics.totalAttempts} attempts</p>
                  </div>
                  <div className="p-4 border rounded-lg dark:border-slate-700 bg-zinc-100 dark:bg-slate-800 hover:shadow-md dark:hover:shadow-slate-700 transition-shadow">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Average Score</h3>
                    <p className="text-sm">{analytics.averageScore}</p>
                  </div>
                  <div className="p-4 border rounded-lg dark:border-slate-700 bg-zinc-100 dark:bg-slate-800 hover:shadow-md dark:hover:shadow-slate-700 transition-shadow">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Average Accuracy</h3>
                    <p className="text-sm">{analytics.averageAccuracy}%</p>
                  </div>
                </div>

              </div>
            </>
          ) : (
            selectedQuiz && <p className="text-lg text-gray-700 dark:text-inherit">Loading analytics...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizAnalytics;
