'use client';

import { saveQuizAttempt, isValidAttempt } from '@/actions/useractions.js';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SegmentRenderer } from '@/components/Dashboard/indi/create/QuestionPreview';
import QuizPageNav from './QuizPageNav.js';

const QuizAttemptPage = ({ quizData }) => {
    const router = useRouter();
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [user, setUser] = useState("");
    const [userData, setUserData] = useState("");
    const [loading, setLoading] = useState(false);
    

    const handleAnswerChange = (e, questionId, answer) => {
        // e.preventDefault();
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const unansweredQuestions = quizData.questions.filter(
            (q) => !selectedAnswers[q._id]
        );
        if (unansweredQuestions.length > 0) {
            toast.info("Please answer all questions before submitting.", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
            });
            return;
        }

        // console.log("Submitted answers:", selectedAnswers);
        const { totalMarks, maxMarks, totalQuestions, correctQuestions } = calculateMarks(quizData, selectedAnswers);
        // console.log(`You scored ${totalMarks} out of ${maxMarks}`);
        // console.log(`Total Questions: ${totalQuestions}, Correct Questions: ${correctQustions}`);

        // console.log(quizData)

        // Prepare data for submission
        const quizAttemptData = {
            quizId: quizData._id, // MongoDB ObjectId for the quiz
            userEmail: user, // User's email
            score: totalMarks,
            totalQuestions,
            maxMarks,
            correctQuestions,
            attemptedQuestions: Object.keys(selectedAnswers).length,
            answers: selectedAnswers, // Directly map questionId to selected answer
        };

        try {
            // Submit quiz attempt
            const result = await saveQuizAttempt(quizAttemptData);
            // console.log(result);

            if (result.success) {
                // alert(`You scored ${totalMarks} marks out of ${maxMarks}. Your attempt has been saved.`);
                toast.success(`Your attempt has been saved.`, {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                });
                setTimeout(() => {
                    // Redirect to result page
                    router.push(`/quiz/${quizData._id}/result?userEmail=${user}`);
                }, 3000);

            } else {
                // alert(result.message);
                toast.error(result.message, {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                });
            }
        } catch (error) {
            console.error("Error submitting quiz attempt:", error);
            toast.error("An error occurred while submitting your quiz attempt.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
            });
            // alert("An error occurred while submitting your quiz attempt.");
        }
        setLoading(false);

    };

    const calculateMarks = (quizData, selectedAnswers) => {
        let totalMarks = 0;
        let maxMarks = 0;
        let totalQuestions = quizData.questions.length;
        let correctQuestions = 0;

        quizData.questions.forEach((question) => {
            maxMarks += question.marks;

            // const correctOption = question.options.find((option) => option.isCorrect);
            const correctOption = question.options[question.correctOption];
            if (selectedAnswers[question._id] === correctOption) {
                totalMarks += question.marks;
                correctQuestions += 1;
            }
        });

        return { totalMarks, maxMarks, totalQuestions, correctQuestions };
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        if (!/\S+@\S+\.\S+/.test(userData)) {
            alert("Please enter a valid email address.");
            return;
        }
        setLoading(true);
        try{
        const isValid = await isValidAttempt(quizData._id, userData);
        // console.log(isValid);
        
        if (!isValid) {
            toast.info("You have already attempted this quiz. Redirecting to result...", {
                position: "top-center",
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
            });
            // console.log("QuizPage: ", quizData);
            setTimeout(() => {
                // Redirect to result page
                router.push(`/quiz/${quizData._id}/result?userEmail=${userData}`);
            }, 3000);
            return;
        }
        }
        catch(err){
            // console.log(err);
        }
        setUser(userData);
        setLoading(false);
    };


    // Calculate Progress Percentage
    const progressPercentage = (Object.keys(selectedAnswers).length / quizData.questions.length) * 100;

    if (user.length === 0) {
        return (<>
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
                toastStyle={{ background: "#FF5F1F", width: "100%" }}
            />
            <QuizPageNav />
            <div className="flex flex-col items-center justify-center text-neutral-800 dark:text-[#e3e3e3]  px-5 py-10 sm:p-10 min-h-screen dark:from-slate-900 dark:to-slate-900 bg-gradient-to-b from-orange-100 to-orange-300">
                <div className="bg-white dark:bg-slate-800 dark:border dark:border-slate-700 dark:shadow-slate-950 shadow-lg rounded-xl p-8 w-full max-w-xl">
                    <h3 className="text-2xl font-bold text-center text-[#FF5F1F] mb-4">{quizData.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                        Enter your email to start attempting the quiz.
                    </p>
                    <form onSubmit={handleUserSubmit} className="flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={userData}
                            onChange={(e) => setUserData(e.target.value)}
                            className="border-[1.4px] border-gray-300 dark:border-slate-600 bg-transparent rounded-lg px-4 py-2  focus:ring-2 dark:focus:ring-[#fd8454] focus:ring-[#ff956b] outline-none"
                        />
                        <button
                            type="submit"
                            className="bg-[#FF5F1F] bg-opacity-90 text-white py-2 rounded-lg hover:bg-opacity-100 transition shadow-md"
                        >
                            {loading ? "Loading..." : "Start Quiz"}
                        </button>
                    </form>
                </div>
            </div>
            </>
        );
    }

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
                toastStyle={{ background: "#FF5F1F" }}
            />
            <QuizPageNav />
            <div className="min-h-screen text-neutral-800 dark:text-[#e3e3e3]  bg-gradient-to-b from-gray-200 to-gray-300  dark:from-slate-900 dark:to-slate-900 sm:p-6">
                <div className="bg-white min-h-screen xl:min-h-full relative dark:bg-slate-800 sm:border border-zinc-300 dark:border-slate-700  shadow-xl dark:shadow-slate-950 sm:rounded-lg transition-all duration-500 max-w-4xl xl:max-w-6xl mx-auto p-8">
                    <h3 className="text-2xl font-bold text-center text-[#FF5F1F] mb-6">{quizData.title}</h3>
                    {/* Progress Bar */}
                    <div className="mb-6 sticky top-20 bg-white dark:bg-slate-600 dark:bg-opacity-50 dark:backdrop-blur-md py-2 px-4 sm:p-4 rounded-lg dark:shadow-slate-900 shadow-md border dark:border-slate-600 border-gray-200 z-10">
                        <p className="text-lg font-semibold text-gray-700 dark:text-neutral-400">Progress: {Math.round(progressPercentage)}%</p>
                        <div className="relative w-full h-4 rounded-full overflow-hidden">
                            <div className="bg-gray-300 dark:bg-slate-500 w-full h-full rounded-full">
                                <div
                                    className="bg-[#FF5F1F] h-full rounded-full"
                                    style={{
                                        width: `${progressPercentage}%`,
                                        transition: 'width 0.5s ease-in-out',
                                    }}
                                ></div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                                {Math.round(progressPercentage)}%
                            </div>
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="flex flex-col gap-6">
                        {quizData.questions.map((question, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-slate-700 dark:bg-opacity-40 dark:border-slate-600 p-6 rounded-lg shadow-md dark:shadow-slate-900 border border-gray-200">
                                <div className="flex gap-2 mb-4">
                                <h4 className="font-semibold">
                                    Q{index + 1}.
                                </h4>
                                <div className=" overflow-auto space-y-4" >
                                {question.questionText.map((segment, segIndex) => (
                                    <SegmentRenderer
                                        key={segIndex}
                                        segment={segment}
                                        isAttempting={true}
                                        isEditing={false}
                                    />
                                ))}
                                </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {question.options.map((option, optIndex) => (
                                        <label
                                            key={optIndex}
                                            className="flex items-center gap-3 p-3 border dark:border-slate-600 border-gray-300 rounded-lg dark:hover:shadow-slate-950 hover:shadow-md transition cursor-pointer dark:bg-slate-700"
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${question._id}`}
                                                value={option}
                                                checked={selectedAnswers[question._id] === option}
                                                onChange={(e) =>
                                                    handleAnswerChange(e, question._id, option)
                                                }
                                                className="form-radio accent-[#FF5F1F]  "
                                            />
                                            <span className="text-gray-800 dark:text-neutral-300">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-between gap-4">
                        <button
                            onClick={() => setUser("")}
                            className="bg-[#FF5F1F] text-white py-2 px-3 sm:px-6 rounded-lg hover:bg-[#FF4c00] transition shadow-md ">Go Back</button>
                        <div className="flex gap-2 sm:gap-4">
                            <button
                                onClick={() => setSelectedAnswers({})}
                                className="bg-red-500 text-white py-2 px-3 sm:px-6 rounded-lg hover:bg-red-600 transition shadow-md ">Clear</button>
                            <button
                                onClick={handleSubmit}
                                className="bg-green-500 text-white py-2 px-3 sm:px-6 rounded-lg hover:bg-green-600 transition shadow-md"
                            >
                                {loading ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default QuizAttemptPage;
