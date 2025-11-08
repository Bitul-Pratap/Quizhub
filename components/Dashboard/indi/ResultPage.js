'use client';
import React, { useEffect, useState } from 'react';
import { getQuizAttemptDetails, getQuizFeedback } from '@/actions/useractions.js';
import io from 'socket.io-client';
import { SegmentRenderer } from '@/components/Dashboard/indi/create/QuestionPreview';
import QuizPageNav from '@/components/QuizPageNav.js';

const ResultPage = ({ quizId, userEmail }) => {
    const [quizResult, setQuizResult] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMsg, setLoadingMsg] = useState('Connecting to server ');

    useEffect(() => {
        // Fetch the quiz attempt result for the user
        const fetchQuizData = async () => {
            try {
                const result = await getQuizAttemptDetails(quizId, userEmail);
                setQuizResult(result);

                // const leaderboardData = await getLeaderboard(quizId);
                // setLeaderboard(leaderboardData.slice(0, 10));

                // // Find user's rank in the leaderboard
                // const userRankData = leaderboardData.findIndex(user => user.userEmail === userEmail);
                // console.log(userRankData);
                // setUserRank(userRankData !== -1 ? userRankData + 1 : leaderboardData.length + 1);

                const feedbackData = await getQuizFeedback(quizId, userEmail);
                console.log("Result Page: ", result, feedbackData, quizId, userEmail);
                setFeedback(feedbackData);
            } catch (error) {
                console.error('Error fetching quiz data:', error);
            }
        };

        fetchQuizData();

        // Connect to socket server
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
            query: { quizId },
            transports: ['websocket'],
            reconnectionAttempts: 5, // Limit reconnection attempts to 5
            reconnectionDelay: 4000, // Start with 4 second delay
            reconnectionDelayMax: 16000, // Maximum delay of 16 seconds
        });

        let attempt = 0;
        socket.on('connect_error', () => {
            attempt++;
            setLoading(true);
            setLoadingMsg("Taking longer than usual to connect, retrying ");
            console.info(attempt);
            if (attempt >= 5) {
                setLoadingMsg("Error connecting to server, refresh the page to try again.");
                setLoading(false);
            }
        });

        socket.on('connect', () => {
            setLoadingMsg("Connected");
        });

        socket.on('connecting', () => {
            setLoading(true);
        });

        socket.on('leaderboardUpdate', (updatedBoard) => {
            setLoading(true);
            setLeaderboard((prevLeaderboard) => {
                return [...updatedBoard].slice(0, 10);
            });
            // console.log("leaderboard updated ", updatedBoard, leaderboard);
            const userRankData = updatedBoard.findIndex(user => user.userEmail === userEmail.toLowerCase());
            // console.log(userRankData);
            setUserRank(userRankData !== -1 ? userRankData + 1 : updatedBoard.length + 1);
            setLoading(false);
        })

        return () => {
            socket.disconnect();
        }

    }, [quizId, userEmail]);

    return (
        <>
        <QuizPageNav />
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 dark:from-slate-900 dark:to-slate-900 text-neutral-800 dark:text-[#e3e3e3] md:p-6">
            <div className="bg-white dark:bg-slate-800 dark:shadow-slate-900 dark:border dark:border-slate-700 shadow-2xl md:rounded-lg max-w-4xl min-h-screen xl:min-h-full xl:max-w-6xl mx-auto py-8 px-4 sm:p-8 transition-all duration-500">
                {/* User Result Section */}
                <div className="bg-white dark:bg-slate-700 dark:border-slate-600 dark:bg-opacity-40 flex flex-col items-center gap-4 rounded-lg shadow-lg p-6 mb-8 border border-gray-200 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-semibold text-[#FF5F1F] animate-fade-in-down">
                        Your Quiz Result
                    </h3>
                    {quizResult ? (
                        <div className="flex gap-4 sm:gap-12 justify-center animate-fade-in-up">
                            <div className="flex flex-col gap-2">
                                <p className="text">Total Questions: <span className="font-bold">{quizResult.totalQuestions}</span></p>
                                <p className="text">Max Marks: <span className="font-bold">{quizResult.maxMarks}</span></p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text">
                                    Correct Questions:{' '}
                                    <span className="font-bold text-green-600">{quizResult.correctQuestions}</span>
                                </p>
                                <p className="text">
                                    Marks Scored:{' '}
                                    <span className="font-bold text-green-600">{quizResult.score}</span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p>Loading your score ...</p>
                    )}
                </div>

                {/* Leaderboard Section */}
                <div className="bg-white dark:bg-slate-700 dark:border-slate-600 dark:bg-opacity-40 rounded-lg shadow-lg p-6 mb-8 border border-gray-200 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-semibold text-center text-[#FF5F1F] mb-4 animate-fade-in-down">
                        Leaderboard
                    </h3>
                    {loading && (
                        <div className="flex items-center justify-center gap-3">
                            {loadingMsg}
                            <div className="animate-spin rounded-full h-6 w-6 border-t-[3px] border-[#FF5F1F]"></div>
                        </div>
                    )}
                    {!loading && leaderboard.length > 0 && (
                        <div className="overflow-x-auto rounded ">
                            <table className="min-w-full border dark:border-slate-700 rounded table-auto text-sm">
                                <thead>
                                    <tr className="bg-[#FF5F1F] text-white">
                                        <th className="px-2 sm:px-6 py-3 text-center sm:text-left rounded-tl">Rank</th>
                                        <th className="px-2 sm:px-6 py-3 text-center sm:text-left">User Email</th>
                                        <th className="px-2 sm:px-6 py-3 text-center sm:text-left rounded-tr">Score</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {leaderboard.map((user, index) => (
                                        <tr
                                            key={user.userEmail}
                                            className={`border-b dark:border-slate-600 ${user.userEmail === userEmail.toLowerCase()
                                                ? 'bg-yellow-300 dark:bg-emerald-500 font-bold'
                                                : index % 2 === 0
                                                    ? 'bg-gray-100 dark:bg-slate-600'
                                                    : 'bg-white dark:bg-slate-700'
                                                } hover:bg-gray-200 dark:hover:bg-slate-800 transition-all duration-200`}
                                        >
                                            <td className="px-2 sm:px-6 py-3 text-center">{index + 1}</td>
                                            <td className="px-2 sm:px-6 py-3 text-ellipsis font-semibold">{user.userEmail}</td>
                                            <td className="px-2 sm:px-6 py-3 text-center">{user.score}</td>
                                        </tr>
                                    ))}


                                    {/* Animate the user's position separately if they are outside the top 10 */}
                                    {userRank > 10 && (
                                        <tr
                                            className="border-t-2 border-gray-400 bg-yellow-100 dark:text-black font-bold rounded"
                                        >
                                            <td className="px-2 sm:px-6 py-3 text-center">{userRank}</td>
                                            <td className="px-2 sm:px-6 py-3 text-ellipsis">{userEmail}</td>
                                            <td className="px-2 sm:px-6 py-3 text-center">
                                                {leaderboard.find(user => user.userEmail === userEmail)?.score ?? quizResult?.score}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!loading && leaderboard.length === 0 && <p className='text-center'>{loadingMsg} 😐</p>}

                </div>

                {/* Quiz Feedback Section */}
                <div className="bg-white dark:bg-slate-700 dark:border-slate-600 dark:bg-opacity-40 rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-semibold text-center mb-4 text-[#FF5F1F] animate-fade-in-down">
                        Answers
                    </h3>
                    {feedback.length > 0 ? (
                        <div className="animate-fade-in-up">
                            {feedback.map((question, index) => (
                                <details
                                    key={index}
                                    className="mb-4 border dark:border-slate-700 border-gray-200 rounded-lg shadow-sm transition-all duration-300"
                                >
                                    <summary className="p-3 cursor-pointer dark:bg-slate-800/50 dark:border-slate-600 dark:hover:bg-slate-800 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                                        <strong>Q{index + 1}:</strong>
                                        <div className=" space-y-4">
                                            {question.questionText.map((segment, segIndex) => (
                                                <SegmentRenderer
                                                    key={segIndex}
                                                    segment={segment}
                                                    isAttempting={true}
                                                    isEditing={false}
                                                />
                                            ))}
                                        </div>
                                    </summary>
                                    <div className="p-3 text-neutral-800">
                                        <div
                                            className={`p-3 rounded-lg ${question.isCorrect ? 'bg-green-100 dark:bg-green-200' : 'bg-red-200 dark:bg-red-200'
                                                }`}
                                        >
                                            <strong>Your Answer:</strong> {question.userAnswer}
                                        </div>
                                        <div className="p-3 rounded-lg bg-green-300 dark:bg-green-300 mt-2">
                                            <strong>Correct Answer:</strong> {question.correctOption}
                                        </div>
                                    </div>
                                    {question.explanation.length > 0 && (
                                        <div className='p-3 pt-0 text-neutral-800 dark:text-inherit'>
                                            <strong>Explanation:</strong> {question.explanation}
                                        </div>
                                    )}
                                </details>
                            ))}
                        </div>
                    ) : (
                        <p className='text-center'>Loading answers</p>
                    )}
                </div>
            </div>
        </div>
        </>
    );
};

export default ResultPage;