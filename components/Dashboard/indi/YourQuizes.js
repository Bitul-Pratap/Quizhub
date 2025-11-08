'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { fetchQuizData, fetchQuizInfo, getUserId, terminateQuiz, deleteQuiz, updateQuiz } from '@/actions/useractions.js';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import Loading from '@/components/Loading';
import { QuestionPreview } from './create/QuestionPreview';


const YourQuizes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const { data: session } = useSession();

    const [loading, setLoading] = useState(true);
    const [loadingQData, setLoadingQData] = useState(false);

    const [selectedQuiz, setSelectedQuiz] = useState(null); // Track the selected quiz
    const [modalType, setModalType] = useState(""); // "actions", "edit", "confirmDelete"
    const [isModalOpen, setIsModalOpen] = useState(false); // Track if modal is open
    const [isAnimating, setIsAnimating] = useState(false); // Track if animation is happening

    const [editFormData, setEditFormData] = useState({}); // For editing quiz
    const [deletedQuestionIds, setDeletedQuestionIds] = useState([]);
    const [mcqs, setMcqs] = useState([]);
    const [errors, setErrors] = useState({});
    const [quizLink, setQuizLink] = useState("");

    const [subjects, setSubjects] = useState([]); // Track the subjects of the quizzes for filtering
    const [selectedSub, setSelectedSub] = useState("All"); // Track the selected subject for filtering

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        getQuizes();

        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768); // Mobile: width < 768px
        };

        checkScreenSize(); // Run initially
        window.addEventListener("resize", checkScreenSize); // Listen for resize


        return () => window.removeEventListener("resize", checkScreenSize);

    }, [session?.user?.email]); // Fetch quizzes on page load

    const getQuizes = async () => {
        setLoading(true);
        if (session?.user?.email) {
            const userId = await getUserId(session.user.email);
            const quizes = await fetchQuizInfo(userId);
            const today = new Date();
            quizes.forEach((quiz) => {
                quiz.isActive = quiz.endDate ? new Date(quiz.endDate) > today : true;
            })
            setQuizzes([...quizes]);
            // seperate the different subjects
            let subjects = [];
            quizes.forEach((quiz) => {
                if (!subjects.includes(quiz.subject)) {
                    subjects.push(quiz.subject);
                }
            });
            setSubjects([...subjects]);
            console.log("Fetched Quizzes:", quizes);
        }
        setLoading(false);
    };

    //utility function
    function convertToMongoDate(inputDate) {
        const [day, month, year] = inputDate.split('/').map(Number); // Split and convert to numbers
        return new Date(year, month - 1, day); // Month is 0-indexed
    }

    const handleCopyLink = () => {
        //Copy to clipboard
        navigator.clipboard.writeText(quizLink);
        toast.success("Link copied", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
        });
    }

    // Handle quiz click to open action modal
    const handleQuizClick = (quiz) => {
        // console.log(quiz.quizId);
        setSelectedQuiz(quiz.quizId); // Set the selected quiz
        setModalType("actions"); // Open action modal
        setIsAnimating(true); // Trigger animation for modal opening
        setIsModalOpen(true); // Show modal
    };

    //Share quiz
    const handleShareQuiz = async (quizId) => {
        setQuizLink(`${process.env.NEXT_PUBLIC_URL}/quiz/${quizId}`);
        setModalType("share");
    };

    // Terminate quiz
    const handleTerminateQuiz = async (quizId) => {
        // console.log("Terminating quiz with ID:", quizId);
        var res = await terminateQuiz(quizId);
        // console.log(res);
        if (res.success) {
            toast.success(res.message, {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
            });
            getQuizes();
        }
        else {
            toast.error("Error occurred while terminating quiz", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
            });
        }
    }

    // Open edit modal
    const handleEditQuiz = async (quizId) => {
        setLoadingQData(true);
        const quizData = await fetchQuizData(quizId);
        // console.log(quizData);
        setEditFormData({
            title: quizData.title,
            creater: quizData.creater,
            subject: quizData.subject,
            endless: quizData.endless,
            endDate: quizData.endDate?.toLocaleString('en-IN').split(',')[0],
        }); // Populate edit form
        // ensure each question has an `id` property equal to `_id`
        const questionsWithId = (quizData.questions || []).map(q => ({ ...q, id: q._id }));
        setMcqs(questionsWithId);
        setLoadingQData(false);
        // setTimeout(() => {
        //     console.log(mcqs);
        //     // console.log(editFormData.endDate.toLocaleString('en-IN').split(",")[0]);
        // }, 3000)
        // console.log(mcqs)
        setModalType("edit"); // Open edit modal
    };

    // Open confirmation delete modal
    const handleDeleteQuiz = (quiz) => {
        setSelectedQuiz(quiz);
        setModalType("confirmDelete");
    };

    // Handle deleting the quiz
    const handleConfirmDelete = async () => {
        // console.log("Deleting quiz with ID:", selectedQuiz);
        const res = await deleteQuiz(selectedQuiz);

        if (!res.success) {
            toast.error("Error occurred while deleting quiz", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
            });
            return;
        }
        else {
            setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.quizId !== selectedQuiz)); // Remove from state
            toast.success(res.message, {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
            });
        }
        closeModal();
    };

    const handleChange = (e, index) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('mc_')) {
            // Update multiple choice question options dynamically
            const updatedQuestions = [...mcqs];
            // console.log(updatedQuestions)
            const [_, category, i] = name.split('_'); // Better destructuring
            // console.log(category, i, index)
            if (category === "question") updatedQuestions[index].questionText = value;
            else if (category === "correctAnswer") {
                // Update the correct answer based on the selected value
                updatedQuestions[index].options.forEach(option => {
                    option.isCorrect = option.text === value;
                });
            }
            else updatedQuestions[index].options[category].text = value;
            setMcqs(updatedQuestions);
        }
        else if (name.startsWith('marks')) {
            const updatedQuestions = [...mcqs];
            updatedQuestions[index].marks = value;
            setMcqs(updatedQuestions);
        }
        else {
            if (type === 'checkbox') {
                editFormData.endDate = "";
            }
            setEditFormData({
                ...editFormData,
                [name]: type === 'checkbox' ? checked : value,
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate title
        if (!editFormData.title?.trim()) {
            newErrors.title = 'Quiz title is required';
        }
        // Validate validity (endless or endDate)
        if (!editFormData.endless && !editFormData.endDate?.trim()) {
            newErrors.endDate = 'End date is required when "Till you close" is not selected';
        }
        // Validate questions
        mcqs.forEach((mcq, index) => {
            newErrors[`question_${index}`] = [];
            if (!mcq.questionText || mcq.questionText.length === 0 || !mcq.questionText.some(segment => segment.content.trim() !== '')) {
            newErrors[`question_${index}`].push({ field: 'questionText', message: 'Question text is required.' });
        }

        if (!mcq.options.every(opt => typeof opt === 'string' && opt.trim() !== '')) {
            newErrors[`question_${index}`].push({ field: 'options', message: 'All options must be non-empty.' });
        }
        if (!(mcq.correctOption + 1)) {
            newErrors[`question_${index}`].push({ field: 'correctOption', message: 'Correct answer is required.' });
        }
        if (mcq.marks === undefined ||
            mcq.marks === null ||
            mcq.marks === "") {
            newErrors[`question_${index}`].push({ field: 'marks', message: 'Marks are required.' });
        }
        if (newErrors[`question_${index}`].length === 0) {
            delete newErrors[`question_${index}`];
        }
        });
        return newErrors;
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        // console.log(validationErrors)
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setModalType("confirmSubmit");
    };

    const handleConfirmEditSubmit = async (res) => {
        if (res === 'yes') {
            // console.log("Edited Quiz Data:", editFormData, mcqs);
            // Prepare the quiz data for submission
            var updatedQuiz = {
                // ...editFormData, // Include title, validity, etc.
                title: editFormData.title,
                creater: editFormData.creater,
                subject: editFormData.subject,
                endless: editFormData.endless,
                endDate: editFormData.endless ? null : convertToMongoDate(editFormData.endDate),
                questions: mcqs.map((q) => ({
                    _id: q._id || undefined, // Include _id if it exists, otherwise set to undefined
                    questionText: q.questionText,
                    options: q.options,
                    marks: q.marks,
                    explanation: q.explanation || undefined,
                    correctOption: q.correctOption,
                })),
                deletedQuestions: deletedQuestionIds,
            };
            // console.log("final data", updatedQuiz);
            setDeletedQuestionIds([]);
            // Implement server action to update quiz here...
            let res = await updateQuiz(selectedQuiz, updatedQuiz);
            // console.log(res);
            if (res.success) {
                toast.success(res.message, {
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
                // update only the updated quiz data in quizzes
                let updatedQuizzes = [...quizzes];
                if (res?.data) {
                    res.data.isActive = res.data.endDate ? new Date(res.data.endDate) > new Date() : true;
                }
                let index = updatedQuizzes.findIndex((quiz) => quiz.quizId === selectedQuiz);
                updatedQuizzes[index] = { ...updatedQuizzes[index], ...res.data };
                setQuizzes(updatedQuizzes);

            }
            else {
                toast.error(res.message, {
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
            closeModal();
        }
        if (res === 'no') {
            setModalType('edit');
        }

    }

    const handleAddQuestion = (e) => {
        e.preventDefault();
        setMcqs([...mcqs, {
            questionText: [{ type: "text", content: "" }],
            options: ['', '', '', ''],
            marks: null,
            correctOption: null,
        },]);
    };

    const handleDeleteQuestion = (e, index) => {
        e.preventDefault();
        const updatedQuestions = [...mcqs];
        setErrors({});
        // Track the ID if it's an existing question
        const deletedQuestion = updatedQuestions[index];
        if (deletedQuestion._id) {
            setDeletedQuestionIds([...deletedQuestionIds, deletedQuestion._id]);
        }
        // Remove the question from the list
        updatedQuestions.splice(index, 1);
        setMcqs(updatedQuestions);
        // setMcqs((prevMcqs) => prevMcqs.filter((_, qIndex) => qIndex !== index));
    };

    // Go Back to the Action Modal from Edit Modal
    const goBackToActionsModal = () => {
        setModalType("actions"); // Set modal type to 'actions' to go back to the quiz actions modal
    };

    // Close modals with slide-out animation
    const closeModal = () => {
        setIsAnimating(false); // Trigger animation for modal closing
        setTimeout(() => {
            setSelectedQuiz(null); // Clear selected quiz after animation
            setModalType(""); // Close modal
            setIsModalOpen(false); // Hide modal
        }, 300); // Wait for animation to complete
    };

    //subject selection
    const handleSubjectSelect = (subject) => {
        // console.log(subject, selectedSub);
        setSelectedSub(subject);
    }

    const updateQuestion = (id, updatedQuestion) => {
        setMcqs((prev) => prev.map((q) => (q._id === id ? { ...q, ...updatedQuestion } : q)))
    }

    const removeQuestion = (id) => {
        setMcqs((prev) => prev.filter((q) => q._id !== id))
    }

    // Modal Content Rendering
    const renderModalContent = () => {
        switch (modalType) {
            case "actions":
                return (
                    <>
                        <h2 className="text-lg font-bold">Quiz Actions</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            What would you like to do with the quiz <strong>{selectedQuiz.title}</strong>?
                        </p>
                        <div className="mt-4 flex sm:flex-row flex-col text-white dark:text-[#e3e3e3] sm:justify-end gap-2">
                            <button
                                className="bg-teal-500  px-4 py-2 rounded shadow hover:bg-teal-600 hover:shadow-lg transition-all"
                                onClick={() => handleShareQuiz(selectedQuiz)}
                            >
                                Share Quiz
                            </button>
                            <button
                                className="bg-indigo-500  px-4 py-2 rounded shadow hover:bg-indigo-600 hover:shadow-lg transition-all"
                                onClick={() => handleEditQuiz(selectedQuiz)}
                            >
                                Edit Quiz
                            </button>
                            <button
                                className="bg-amber-500  px-4 py-2 rounded shadow hover:bg-amber-600 hover:shadow-lg transition-all"
                                onClick={() => handleTerminateQuiz(selectedQuiz)}
                            >
                                Terminate Quiz
                            </button>
                            <button
                                className="bg-rose-500 px-4 py-2 rounded shadow hover:bg-rose-600 hover:shadow-lg transition-all"
                                onClick={() => handleDeleteQuiz(selectedQuiz)}
                            >
                                Remove Quiz
                            </button>
                        </div>
                        {loadingQData ? <p className='text-center mt-4 text-gray-600 dark:text-gray-400'>Loading...</p> : null}

                    </>
                );
            case "edit":
                return (
                    <>
                        <h2 className="text-xl font-semibold mb-4">Edit Quiz</h2>
                        <form onSubmit={handleEditSubmit} className="space-y-4 flex flex-col gap-2">
                            <div className='flex flex-col gap-1'>
                                <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name='title'
                                    value={editFormData.title ? editFormData.title : ""}
                                    onChange={handleChange}
                                    // (e) => setEditFormData({ ...editFormData, title: e.target.value })
                                    className={`w-full border-b-[1.4px] border-gray-400 dark:border-slate-700 bg-transparent p-1 rounded-t shadow-sm focus:border-orange-400 outline-none text-sm ${errors.title ? 'border-red-500' : 'border-gray-400'
                                        }`}
                                />
                                {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
                                {/* Validity Section */}
                                <fieldset className="border p-3 rounded mt-4 dark:border-slate-600">
                                    <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">Validity</legend>
                                    <div className="flex flex-col sm:flex-row justify-around items-center">
                                        {/* Endless Checkbox */}
                                        <div id="validity" className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="endless"
                                                id="endless"
                                                className="cursor-pointer"
                                                checked={editFormData.endless}
                                                onChange={handleChange}
                                            // (e) =>
                                            //     setEditFormData({
                                            //         ...editFormData,
                                            //         endless: e.target.checked,
                                            //         endDate: e.target.checked ? null : editFormData.endDate, // Clear endDate if endless
                                            //     })

                                            />
                                            <label htmlFor="endless" className="text-sm">
                                                Till you close
                                            </label>
                                        </div>
                                        <span className="text-sm">or</span>
                                        {/* Expiry Date Input */}
                                        <div className="flex flex-col sm:flex-row gap-2 items-center">
                                            <label htmlFor="endDate" className="text-sm">
                                                Enter date:
                                            </label>
                                            <input
                                                type="text"
                                                name="endDate"
                                                id="endDate"
                                                placeholder="dd/mm/yyyy"
                                                className={`border-[1.4px] px-2 py-1 text-center sm:text-left rounded focus:border-orange-400 outline-none bg-transparent border-gray-400 dark:border-slate-700 text-sm disabled:cursor-not-allowed disabled:bg-gray-200 dark:disabled:bg-slate-600 dark:bg-slate-900 ${errors.endDate ? 'border-red-500' : 'border-gray-400'
                                                    } `}
                                                value={editFormData.endDate || ""}
                                                onChange={handleChange}
                                                // (e) => setEditFormData({ ...editFormData, endDate: e.target.value })
                                                disabled={editFormData.endless} // Disable if endless is selected
                                            />
                                        </div>
                                    </div>
                                    {errors.endDate && <p className="text-red-500 text-xs text-center mt-1">{errors.endDate}</p>}
                                </fieldset>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Questions</p>

                                {mcqs.map((question, index) => (
                                    <div key={index} className="mb-2 shadow-2xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                                        <QuestionPreview
                                            question={question}
                                            index={index}
                                            isPreview={true}
                                            updateQuestion={updateQuestion}
                                            removeQuestion={removeQuestion}
                                        />
                                        {errors[`question_${index}`] && (
                                            errors[`question_${index}`].map((err, errIdx) => (
                                                <p key={errIdx} className="text-red-500 text-xs mb-2 mx-4">• {err.message}</p>
                                            ))
                                        )}
                                    </div>
                                ))}

                                <button title='Add question' onClick={(e) => handleAddQuestion(e)} className='add bg-slate-200 w-8 h-8 rounded-md text-gray-500 dark:text-inherit border dark:border-neutral-700 bg-transparent border-gray-300 text-xl items-center active:bg-slate-300 active:border-gray-400'>+</button>

                                {/* <div className='flex flex-col gap-4'>
                                    {mcqs.map((question, index) => (
                                        <div key={index} className='flex flex-col gap-1'>
                                            <div className='flex items-center gap-2 mb-1'>
                                                <label htmlFor={`question_${index + 1}`} className='text-sm font-medium'>Q{index + 1}.</label>
                                                <input
                                                    type="text"
                                                    name={`mc_question_${index}`}
                                                    value={question.questionText}
                                                    id={`question_${index + 1}`}
                                                    autoComplete='off'
                                                    placeholder="Enter question"
                                                    className={`w-full pl-1 border-b-[1.4px] border-gray-400 dark:border-neutral-700 bg-transparent p-1 shadow-sm focus:border-orange-400 outline-none text-sm ${errors[`question_${index}`] ? 'border-red-500' : 'border-gray-400'
                                                        }`}
                                                    onChange={(e) => handleChange(e, index)}
                                                />
                                                <input type="number" name={`marks_${index}`} value={question.marks} onChange={(e) => handleChange(e, index)} className={`w-12 border-[1.4px] border-gray-400 dark:border-neutral-700 bg-transparentdark:border-neutral-700 bg-transparent shadow-sm rounded text-center focus:border-orange-400 outline-none text-sm no-spinner ${errors[`marks_${index}`] ? 'border-red-500' : 'border-gray-400'
                                                    } `} placeholder='Marks' />
                                                <button onClick={(e) => handleDeleteQuestion(e, index)} className="delete w-12 h-6 bg-red-500 text-center text-white rounded text-sm ">⨉</button>
                                            </div>
                                            <div className='flex justify-between mb-1 ml-8'>
                                                {errors[`question_${index}`] && <p className="text-red-500 text-xs ">Question is required</p>}
                                                {errors[`marks_${index}`] && <p className="text-red-500 text-xs">Marks should be greater than 0</p>}
                                            </div>
                                            <div className=" ml-7 options flex flex-col gap-1">
                                                {question.options.map((option, optIndex) => (
                                                    <div key={optIndex} className='flex items-center gap-1 w-full'>
                                                        <label className='text-sm font-medium' htmlFor={`option_${optIndex + 1}`}>{String.fromCharCode(65 + optIndex)}.</label>
                                                        <input
                                                            type="text"
                                                            name={`mc_${optIndex}_${index}`}
                                                            value={option.text}
                                                            id={`option_${optIndex + 1}`}
                                                            autoComplete='off'
                                                            placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                                            className={`border-[1.4px] pl-2 py-1 text-sm rounded focus:border-orange-400 outline-none border-gray-400 dark:border-neutral-700 bg-transparent w-full ${errors[`options_${index}`] ? 'border-red-500' : 'border-gray-400'
                                                                } `}
                                                            onChange={(e) => handleChange(e, index)}
                                                        />
                                                    </div>
                                                ))}
                                                {errors[`options_${index}`] && <p className="text-red-500 text-xs ml-5">All options must be filled</p>}
                                            </div>
                                            <label className='text-sm ml-7 flex gap-2 items-center'> Ans.
                                                <select
                                                    name={`mc_correctAnswer_${index}`}
                                                    value={question.options.find((option) => option.isCorrect)?.text || ''}
                                                    onChange={(e) => handleChange(e, index)}
                                                    className={`border-[1.4px] pl-2 py-1 text-sm rounded w-full focus:border-orange-400 outline-none border-gray-400 dark:border-neutral-700 bg-transparent ${errors[`correctAnswer_${index}`] ? 'border-red-500' : 'border-gray-400'
                                                        }`}
                                                >
                                                    <option value="">Select correct option</option>
                                                    {question.options.map((option, optIndex) => (
                                                        <option key={optIndex} value={option.text}>
                                                            {`Option ${String.fromCharCode(65 + optIndex)} : ${option.text}`}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors[`correctAnswer_${index}`] && <p className="text-red-500 text-xs">Correct answer is required</p>}
                                            </label>
                                        </div >
                                    ))}
                                    <button title='Add question' onClick={(e) => handleAddQuestion(e)} className='add bg-slate-200 w-8 h-8 rounded-md text-gray-500 dark:text-inherit border dark:border-neutral-700 bg-transparent border-gray-300 text-xl items-center active:bg-slate-300 active:border-gray-400'>+</button>
                                </div > */}
                                {/* <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    value={editFormData.subject}
                                    onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                /> */}
                            </div >
                            <div className="flex justify-between items-center">
                                <button
                                    type="button"
                                    className="bg-gray-200 text-gray-800 dark:text-inherit px-4 py-2 rounded dark:bg-slate-600 dark:hover:bg-slate-700 hover:bg-gray-300"
                                    onClick={goBackToActionsModal}
                                >
                                    Go Back
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white dark:text-inherit dark:bg-opacity-80 px-4 py-2 rounded hover:bg-blue-600 active:scale-95 transition-transform"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form >
                    </>
                );
            case "confirmDelete":
                return (
                    <>
                        <h2 className="text-lg font-bold">Confirm Deletion</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Are you sure you want to delete the quiz <strong>{selectedQuiz.title}</strong>?
                        </p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                className="bg-gray-200 text-gray-800 dark:text-inherit dark:bg-slate-600 dark:hover:bg-slate-700 px-4 py-2 rounded hover:bg-gray-300"
                                onClick={closeModal}
                            >
                                No
                            </button>
                            <button
                                className="bg-red-500 text-white dark:inherit  px-4 py-2 rounded hover:bg-red-600"
                                onClick={handleConfirmDelete}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </>
                );
            case "confirmSubmit":
                return (
                    <>
                        <h2 className="text-lg font-bold">Confirm Quiz Update</h2>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Are you sure you want to update the quiz. It will replace it from database. <strong>{selectedQuiz.title}</strong>?
                        </p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                className="bg-gray-200 text-gray-800 dark:text-inherit dark:bg-slate-600 dark:hover:bg-slate-700 px-4 py-2 rounded hover:bg-gray-300"
                                onClick={() => { handleConfirmEditSubmit('no') }}
                            >
                                No
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded dark:text-inherit dark:bg-opacity-80 hover:bg-blue-600 active:scale-95 transition-transform"
                                onClick={() => { handleConfirmEditSubmit('yes') }}
                            >
                                Yes, Update
                            </button>
                        </div>
                    </>
                );
            case "share":
                return (
                    <>
                        <h2 className="text-lg font-bold">Share Quiz</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Copy or Share the link.
                        </p>
                        <div className=' flex flex-col sm:flex-row items-center w-full gap-1 sm:gap-2 mt-2'>
                            <input readOnly className='w-full border-[1.4px] border-gray-300 py-2 px-2 sm:px-4 rounded outline-none dark:bg-transparent dark:border-slate-700  focus:border-gray-500' type="text" name="" value={quizLink} />
                            <div className='flex gap-1 sm:gap-0'>
                                <button className='flex items-center active:scale-90 transition-transform dark:invert rounded-full p-1 hover:bg-gray-200' onClick={handleCopyLink} title='Copy Link'>
                                    <img src="copy.svg" alt="copy" />
                                </button>

                                <Link href={quizLink} target='_blank' about='Link' className='flex items-center'>
                                    <button className='flex items-center active:scale-90 transition-transform dark:invert rounded-full p-1 hover:bg-gray-200' title='Open Link'>
                                        <img src="open-link.svg" alt="link" />
                                    </button>
                                </Link>
                                <button
                                    type="button"
                                    title='Share'
                                    className="flex items-center active:scale-90 transition-transform dark:invert rounded-full p-1 hover:bg-gray-200"
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: selectedQuiz.title,
                                                text: 'Check out this quiz!',
                                                url: quizLink,
                                            }).catch((error) => console.error('Error sharing', error));
                                        } else {
                                            alert('Web Share API is not supported in your browser.');
                                        }
                                    }}
                                >
                                    <img src="share2.svg" alt="share" />
                                </button>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="bg-gray-200 text-gray-800 dark:bg-slate-600 dark:hover:bg-slate-700 dark:text-inherit px-4 py-2 mt-4 rounded hover:bg-gray-300"
                            onClick={goBackToActionsModal}
                        >
                            Go Back
                        </button>
                    </>
                )
            default:
                return null;
        }
    };

    return (
        <>
            <div className='flex flex-col  gap-6'>

                <h3 className='text-2xl text-neutral-800 dark:text-[#e3e3e3] text-center font-bold '>Your Quizzes</h3>
                {loading && <Loading content={"Fetching your quizzes..."} />}
                <div className='flex flex-col md:flex-row w-full h-[calc(calc(91.3vh-64px)-48px)] overflow-auto gap-6 2xl:gap-18'>
                    <div className={`subjects w-full md:max-w-[25%] lg:max-w-[25%] min-h-[30%] md:min-h-[50%]  p-4 py-8 flex flex-col overflow-auto transition ease-in-out delay-100 duration-[700ms] ${loading ? "border-t-2 border-transparent" : "border-y-2 border-[#ff5f1f] shadow-[inset_0px_5px_10px_-8px_rgb(255,95,31)] bg-neutral-100 bg-opacity-70 dark:bg-slate-800"} rounded-lg `}>
                        {/* {loading && <div>Loading...</div>} */}
                        {!loading && quizzes.length === 0 && <div className='text-center text-stone-800 dark:text-[#e3e3e3]'>No quizzes created yet!</div>}
                        <div className={`relative -top-6 bg-transparent w-full text-center pt-1 h-fit border-b-[1.4px] border-gray-300 dark:border-slate-600 dark:text-[#e3e3e3] ${loading || quizzes.length === 0 ? "hidden" : "visible"} `}>Subjects</div>
                        <ul className='w-full flex flex-col gap-2'>
                            {quizzes.length > 0 && !loading && (<>
                                <motion.li
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    layout
                                    onClick={() => handleSubjectSelect("All")} className={`subject-box text-center rounded-lg flex flex-col border-2 cursor-pointer relative transition-shadow transition-colors ease-in-out duration-200 hover:shadow-[0_4px_6px_-1px_rgba(255,95,31,0.47)] ${selectedSub === "All" ? "bg-[#FF5F1F] text-white border-[#ff5f1f]" : "bg-white dark:bg-slate-700 text-neutral-800 dark:text-[#e3e3e3] dark:border-slate-600 border-neutral-200"}`}>
                                    <div className="subject text-sm font-semibold">All</div>
                                    <div className={`count text-xs ${selectedSub === "All" ? "text-gray-200" : "text-gray-400"} `}>{quizzes.length} {quizzes.length > 1 ? "Quizzes" : "Quiz"}</div>
                                </motion.li>

                                {subjects.sort().map((subject, index) => (
                                    <motion.li
                                        key={index}
                                        onClick={() => handleSubjectSelect(subject)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 * (index == 0 ? 0.5 : index) }}
                                        layout
                                        className={`subject-box text-center rounded-lg flex flex-col border-2 cursor-pointer relative transition-shadow transition-colors ease-in-out duration-200  hover:shadow-[0_4px_6px_-1px_rgba(255,95,31,0.47)] ${selectedSub === subject ? "bg-[#FF5F1F] text-white border-[#ff5f1f]" : "bg-white dark:bg-slate-700 text-neutral-800 dark:text-[#e3e3e3] dark:border-slate-600 border-neutral-200"} `} >
                                        <div className="subject text-sm font-semibold">{subject}</div>
                                        <div className={`count text-xs ${selectedSub == subject ? "text-gray-200" : "text-gray-400"}`}>{quizzes.filter((quiz) => quiz.subject === subject).length} {quizzes.filter((quiz) => quiz.subject === subject).length > 1 ? "Quizzes" : "Quiz"} </div>
                                    </motion.li>
                                ))}
                            </>
                            )}
                        </ul>
                    </div>
                    <AnimatePresence mode='popLayout' >
                        <div className={`quizes w-full md:w-[80%] min-h-[30%] md:min-h-[50%] p-4 py-8  flex overflow-auto gap-6 flex-wrap justify-around xl:justify-center xl:gap-20 transition ease-in-out delay-100 duration-[700ms] ${loading ? "border-t-2 border-transparent" : "border-y-2 border-[#ff5f1f] shadow-[inset_0px_5px_10px_-8px_rgb(255,95,31)] bg-neutral-100 bg-opacity-70 dark:bg-slate-800"} rounded-lg`}>
                            {quizzes.length === 0 && !loading && <div className='text-stone-800 dark:text-[#e3e3e3]'>No quizzes created yet!</div>}
                            {quizzes
                                .filter((quiz) => selectedSub === "All" || quiz.subject === selectedSub)
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .map((quiz, index) => (
                                    <motion.div
                                        key={quiz._id || index}
                                        onClick={() => handleQuizClick(quiz)}
                                        initial={isMobile ? { opacity: 0, y: 40 } : { opacity: 0, x: 40, rotateY: 180 }}
                                        whileInView={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0, rotateY: 0 }}
                                        exit={isMobile ? { opacity: 0, y: 40 } : { opacity: 0, x: 80, rotateY: -90 }}
                                        transition={{ duration: 0.4, delay: 0.1 * (index), type: 'spring', stiffness: 60 }}
                                        layout
                                        style={{ maxHeight: "min(50%, 275px)" }}
                                        className='quiz-box min-w-[200px] max-w-[15%] min-h-[230px] bg-neutral-200 dark:bg-slate-700
                                        dark:bg-opacity-55 dark:border-slate-700 text-neutral-800 dark:text-[#e3e3e3]  rounded-lg flex flex-col border-2 border-neutral-200 bg-opacity-60 dark:bg-opacity-100 cursor-pointer relative transition-shadow  ease-in-out duration-200  hover:shadow-[0_4px_6px_-1px_rgba(255,95,31,0.47)]'
                                    >
                                        <div className="cover h-3/4 rounded-t-lg">
                                            <img src={null} alt='Quiz cover' className="image w-full h-full border-b-2 border-transparent" />
                                        </div>
                                        <div className="data text-sm h-1/4 rounded-b-lg flex flex-col dark:bg-slate-800 bg-neutral-50 p-2">
                                            <div className="title flex items-center gap-2">
                                                <span className='font-bold'>{quiz.title}</span>•<span>{quiz.subject}</span>
                                            </div>
                                            <div className="date text-xs text-gray-400 flex items-center gap-1">
                                                {quiz?.createdAt?.toLocaleString('en-IN').split(",")[0]}
                                                <span className={`font-semibold ${quiz?.isActive ? "text-green-500" : "text-red-500"}`} >{quiz?.isActive ? "• Active" : "• Expired"}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Single Modal */}
            {modalType && selectedQuiz && isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className={`bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-3xl max-h-[80%] overflow-auto shadow-lg relative dark:text-[#e3e3e3] transition-all duration-300 ${isAnimating ? 'slide-in ease-in' : 'slide-out ease-in'}`}>
                        <button
                            className="absolute top-3 right-3 text-gray-400 dark:hover:text-gray-200 hover:text-gray-600"
                            onClick={closeModal}
                        >
                            ⨉
                        </button>
                        {renderModalContent()}
                    </div>
                </div>
            )}
        </>
    );
};

export default YourQuizes;
