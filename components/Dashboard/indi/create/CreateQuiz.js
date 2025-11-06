'use client';
import { getUserId, storeQuizData } from '@/actions/useractions.js';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import { toast, Bounce } from 'react-toastify';
import { PenTool, Brain, Upload, Save, X, ArrowLeftIcon, GripVertical } from 'lucide-react';
import { ManualCreation } from './ManualCreation';
import { AIGeneration } from './AIGeneration';
import { FileImport } from './FileImport';
import { QuizPreview } from './QuizPreview';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import useMediaQuery from '@/hooks/useMediaQuery';


const CreateQuiz = () => {
    const { data: session } = useSession();
    const [errors, setErrors] = useState({});
    const isLarge = useMediaQuery('(min-width: 1024px)');

    const [quizInfo, setQuizInfo] = useState({
        quizTitle: '',
        quizSubject: '',
        endDate: '',
        endless: false,
    });

    function convertToMongoDate(inputDate) {
        if (typeof inputDate !== 'string') {
            throw new Error('inputDate must be a string like "YYYY/MM/DD"');
        }
        // console.log("Converting date:", inputDate);
        const parts = inputDate.trim().split('-').map(Number);
        // console.log(parts)
        if (parts.length !== 3 || parts.some(isNaN)) {
            throw new Error('Invalid date format — expected "YYYY-MM-DD"');
        }
        const [year, month, day] = parts;
        if (month < 1 || month > 12 || day < 1 || day > 31) {
            throw new Error('Invalid month or day');
        }
        // Use UTC so stored MongoDB Date is consistent across timezones
        return new Date(Date.UTC(year, month - 1, day));
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'date') {
            const selected = new Date(value);
            const today = new Date();
            if (selected < today && !quizInfo.endless) {
                setErrors((prev) => ({ ...prev, endDate: 'Validity Date cannot be in the past.' }));
                return;
            }
        }

        if (type === 'checkbox') {
            setQuizInfo((prev) => ({ ...prev, [name]: checked }));
        } else {
            setQuizInfo((prev) => ({ ...prev, [name]: value }));
        }
    }

    const handleCancel = () => {
        setQuizInfo({
            quizTitle: '',
            quizSubject: '',
            endDate: '',
            endless: false,
        });
        setQuestions([]);
        setFinalise(false);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }
        const userId = await getUserId(session.user.email);
        const quizData = {
            creater: userId,
            title: quizInfo.quizTitle.charAt(0).toUpperCase() + quizInfo.quizTitle.slice(1).toLowerCase(),
            subject: quizInfo.quizSubject.charAt(0).toUpperCase() + quizInfo.quizSubject.slice(1).toLowerCase(),
            endless: quizInfo.endless,
            endDate: quizInfo.endless ? null : convertToMongoDate(quizInfo.endDate),
            questions: questions.map((q) => ({
                questionText: q.questionText,
                options: q.options,
                marks: q.marks,
                explanation: q.explanation || undefined,
                correctOption: q.correctOption,
            })),
        };

        // console.log('Quiz Data:', quizData);

        const quiz = await storeQuizData(quizData);
        // console.log('Quiz creation response:', quiz);

        if (!quiz.success) {
            toast.error('Failed to create quiz. Please try again.', {
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

        else {
            toast.success('Quiz successfully created!', {
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
            // Clear form data and mcqs
            setQuizInfo({
                quizTitle: '',
                quizSubject: '',
                endDate: '',
                endless: false,
            });
            setQuestions([]);
        }

    };

    const validateForm = () => {
        const newErrors = {};
        if (!quizInfo.quizTitle) {
            newErrors.quizTitle = 'Quiz title is required.';
        }
        if (!quizInfo.quizSubject) {
            newErrors.quizSubject = 'Quiz subject is required.';
        }
        if (!quizInfo.endDate && !quizInfo.endless) {
            newErrors.quizValidity = 'Quiz Validity is required.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const [questions, setQuestions] = useState([])
    const [activeTab, setActiveTab] = useState("manual")
    const [finalise, setFinalise] = useState(false);

    const addQuestion = (question) => {
        setQuestions((prev) => [...prev, { ...question, id: Date.now().toString() }])
        // setTimeout(() => {
        //     console.log("Question added:", question);
        // }, 2000);
    }

    const updateQuestion = (id, updatedQuestion) => {
        setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updatedQuestion } : q)))
    }

    const removeQuestion = (id) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id))
    }

    const addMultipleQuestions = (newQuestions) => {
        const questionsWithIds = newQuestions.map((q) => ({
            ...q,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        }))
        setQuestions((prev) => [...prev, ...questionsWithIds])
    }

    const tabs = [{
        key: "manual",
        icon: PenTool,
        label: "Manual Creation",
        component: <ManualCreation onAddQuestion={addQuestion} />
    }, {
        key: "ai",
        icon: Brain,
        label: "AI Generation",
        component: <AIGeneration onAddMultipleQuestions={addMultipleQuestions} />
    }, {
        key: "import",
        icon: Upload,
        label: "File Import",
        component: <FileImport onAddMultipleQuestions={addMultipleQuestions} />
    }]


    const LeftContent = (
        finalise ? (
            <div className='grid grid-rows-none gap-6' >
                {/* Quiz Info */}
                < div className="bg-white/80 w-full dark:bg-slate-800/80 border border-slate-200 p-6 shadow-sm mx-auto rounded-lg " >
                    <div className='space-y-1 mb-4'>
                        <h2 className="text-2xl font-bold" >Quiz Info</h2>
                        <p className="text-slate-600 text-sm dark:text-slate-400">
                            Review and finalize your quiz settings before publishing.
                        </p>
                    </div>
                    <div className='mb-4 space-y-2'>
                        <label htmlFor="quizTitle" className="block text-sm font-medium">Quiz Title</label>
                        <input
                            type="text"
                            id="quizTitle"
                            name="quizTitle"
                            value={quizInfo.quizTitle}
                            onChange={handleChange}
                            placeholder="Enter quiz title"
                            className="w-full p-2 text-sm border border-[#ccc] rounded-md"
                        />
                        {errors.quizTitle && (
                            <div className="text-red-500 text-xs mt-1">{errors.quizTitle}</div>
                        )}
                    </div>
                    <div className='mb-4 space-y-2'>
                        <label htmlFor="quizSubject" className="block text-sm font-medium">Subject</label>
                        <input
                            type="text"
                            id="quizSubject"
                            name="quizSubject"
                            value={quizInfo.quizSubject}
                            onChange={handleChange}
                            placeholder="Enter subject"
                            className="w-full p-2 text-sm border border-[#ccc] rounded-md"
                        />
                        {errors.quizSubject && (
                            <div className="text-red-500 text-xs mt-1">{errors.quizSubject}</div>
                        )}
                    </div>
                    <div id='quizValidity' className='mb-4 space-y-1'>
                        <label htmlFor='quizValidity' className='text-sm font-medium mb-2'>Quiz Validity</label>
                        <div className='flex items-center space-x-2 mb-2'>
                            <input
                                type="checkbox"
                                id="endless"
                                name="endless"
                                checked={quizInfo?.endless}
                                onChange={handleChange}
                                className="cursor-pointer scale-90"
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400">This quiz will be available until you close it.</span>
                        </div>
                        <span className='text-sm'>or</span>
                        <div>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                min={quizInfo.endless ? '' : new Date().toISOString().split('T')[0]} // Disable past dates if not endless
                                value={quizInfo.endDate}
                                disabled={quizInfo.endless}
                                onChange={handleChange}
                                placeholder="Enter validity (e.g., dd/mm/yyyy)"
                                className="w-full p-2 text-sm border border-[#ccc] disabled:bg-gray-200 rounded-md"
                            />
                        </div>
                        {errors.quizValidity && (
                            <div className="text-red-500 text-xs mt-1">{errors.quizValidity}</div>
                        )}
                    </div>
                    <div className='flex space-x-3 pt-4'>
                        <button
                            type="button"
                            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-md"
                            onClick={handleSubmit}
                        >
                            <Save className='w-4 h-4 inline-block mr-1' />
                            Save Quiz
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="bg-white border border-slate-300  px-4 py-2 rounded-md"
                        >
                            Cancel
                        </button>
                    </div>
                </div >
                {/* Quiz summary */}
                < div className="w-full  bg-white/80 dark:bg-slate-800/80 border border-slate-200 p-6 shadow-sm mx-auto rounded-lg" >
                    <h2 className="text-2xl font-bold mb-4">Quiz Summary</h2>
                    <div className="flex justify-between items-start text-sm">
                        <div className="space-y-2">
                            <p><strong>Title:</strong> {quizInfo.quizTitle}</p>
                            <p><strong>Subject:</strong> {quizInfo.quizSubject}</p>
                            <p><strong>Validity:</strong> {quizInfo.endless ? 'Endless' : quizInfo.endDate ? new Date(quizInfo.endDate).toLocaleDateString('In') : 'Not set'}</p>
                        </div>
                        <div className='space-y-2'>
                            <p><strong>Total Questions:</strong> {questions.length}</p>
                            <p><strong>Total Marks:</strong> {questions.reduce((total, q) => total + (q.marks), 0)}</p>
                        </div>
                    </div>
                </div >
            </div >
        ) : (
            // {/* Quiz Creation Section */ }
            < div>
                <div className="w-full">
                    <div className="grid grid-cols-3 bg-slate-200/40 dark:bg-slate-800/80  shadow-md rounded-2xl mb-6">
                        {tabs.map((tab, idx) => (
                            <div key={tab.key}
                                className={`flex items-center cursor-pointer transition-colors delay-100 duration-200 text-sm ${activeTab === tab.key ? 'bg-[#FF5F1F] dark:bg-orange-500 text-white' : ' text-slate-500 dark:text-slate-400 '} py-2 px-2 md:px-4 space-x-2 ${idx == 0 ? ' rounded-l-2xl' : idx == 2 ? 'rounded-r-2xl' : ''}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                <tab.icon className='hidden sm:block w-4 h-4 flex-shrink-0' />
                                <span className='leading-none truncate'>{tab.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6 text-slate-900 dark:text-slate-100">
                        {tabs.find((tab) => tab.key == activeTab)?.component || <ManualCreation onAddQuestion={addQuestion} />}
                    </div>

                </div>
            </div>
        ))


    const RightContent = (
        <div className="text-slate-900 dark:text-slate-100 sticky top-0 ">
            <QuizPreview
                finalise={finalise}
                setFinalise={setFinalise}
                questions={questions}
                onUpdateQuestion={updateQuestion}
                onRemoveQuestion={removeQuestion}
            />
        </div>
    );

    return (
        <>
            <main className="container mx-auto ">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Create a Quiz</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Build engaging quizzes manually, with AI assistance, or by importing content
                    </p>
                </div>
                {finalise && (
                    <div className="mb-6 ">
                        <button className='h-9 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-md flex items-center gap-2'
                            onClick={() => setFinalise(false)}>
                            <ArrowLeftIcon className='w-4 h-4' />
                            Go back
                        </button>
                    </div>
                )}
                {isLarge ? (
                    <PanelGroup direction="horizontal" className="gap-1">
                        <Panel defaultSize={65} minSize={40}>
                            {LeftContent}
                        </Panel>
                        <PanelResizeHandle className="flex items-center justify-center hover:bg-slate-200/20 rounded-full dark:hover:bg-slate-700/50">
                            <GripVertical className="w-4 h-4 text-slate-400" />
                        </PanelResizeHandle>
                        <Panel minSize={30} className="">
                            {RightContent}
                        </Panel>
                    </PanelGroup>
                ) : (
                    <div className={`flex flex-col gap-6`}>
                        {LeftContent}
                        {RightContent}
                    </div>
                )}
            </main>
        </>
    );
}

export default CreateQuiz;

// <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
//     {/* <div className="flex md:flex-row flex-col justify-center gap-4 md:gap-16 border-b-2 border-orange-400 dark:border-neutral-600 pb-6">
//         <div className="flex flex-col gap-2">
//             <div className="flex flex-col gap-1 md:gap-2">
//                 <label htmlFor="title">Quiz title</label>
//                 <input
//                     type="text"
//                     name="title"
//                     value={formData.title ? formData.title : ""}
//                     placeholder="Quiz Title"
//                     className="border-[1.4px] dark:border-neutral-600 dark:focus:border-orange-400 bg-transparent px-2 py-1 rounded focus:border-orange-400 outline-none border-gray-300"
//                     onChange={handleChange}
//                 />
//                 {errors.title && <p className="text-red-500 text-xs mt-2">{errors.title}</p>}
//             </div>
//             <div className="flex flex-col gap-1 md:gap-2">
//                 <label htmlFor="subject">Subject</label>
//                 <input
//                     type="text"
//                     name="subject"
//                     value={formData.subject ? formData.subject : ""}
//                     placeholder="Subject"
//                     className="border-[1.4px] dark:border-neutral-600 dark:focus:border-orange-400 bg-transparent px-2 py-1 rounded focus:border-orange-400 outline-none border-gray-300"
//                     onChange={handleChange}
//                 />
//                 {errors.subject && <p className="text-red-500 text-xs mt-2">{errors.subject}</p>}
//             </div>
//         </div>
//         <fieldset>
//             <legend>Validity</legend>
//             <div className="flex flex-col gap-2 md:flex-row md:gap-6 md:items-center pt-2">
//                 <div id="validity" className="flex items-center gap-2">
//                     <input
//                         type="checkbox"
//                         name="endless"
//                         id="endless"
//                         className="cursor-pointer "
//                         checked={formData.endless ? formData.endless : false}
//                         onChange={handleChange}
//                     />
//                     <label htmlFor="endless">Till you close</label>
//                 </div>
//                 <span>or</span>
//                 <div>
//                     <label htmlFor="endDate">Enter date:</label>
//                     <input
//                         type="text"
//                         name="endDate"
//                         id="endDate"
//                         placeholder="dd/mm/yyyy"
//                         className="border-[1.4px] dark:border-neutral-600 dark:focus:border-orange-400 bg-transparent disabled:bg-gray-200 dark:disabled:bg-neutral-700 px-2 py-1 rounded ml-2 focus:border-orange-400 outline-none disabled:border-gray-300 border-gray-300"
//                         value={formData.endDate ? formData.endDate : ""}
//                         onChange={(e) => {
//                             handleChange(e);
//                             const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
//                             if (e.target.value === "" || regex.test(e.target.value)) {
//                                 setErrors((prevErrors) => {
//                                     const { endDate, ...rest } = prevErrors;
//                                     return rest;
//                                 });
//                             } else {
//                                 setErrors((prevErrors) => ({
//                                     ...prevErrors,
//                                     endDate: "Invalid date format. Use dd/mm/yyyy.",
//                                 }));
//                             }
//                         }}
//                         onKeyPress={(e) => {
//                             if (isNaN(e.key) && e.key !== "/") {
//                                 e.preventDefault();
//                             }
//                         }}
//                         disabled={formData.endless ? formData.endless : false}
//                     />
//                     {errors.endDate && <p className="text-red-500 text-xs mt-2">{errors.endDate}</p>}
//                 </div>
//             </div>
//         </fieldset>
//     </div> */}
//     <label htmlFor="questions font-bold">Questions</label>
//     <AnimatePresence>
//         <div id='questions' className="questions flex flex-col gap-6 mt-2">
//             {/* Multiple choice Question */}
//             {mcqs.map((mcq, index) => (
//                 <motion.div
//                     initial={{ opacity: 0, x: -50 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 50 }}
//                     transition={{ duration: 0.3 }}
//                     layout
//                     key={index} className="flex flex-col md:flex-row gap-6 lg:gap-12 shadow-md dark:shadow-neutral-950 p-3 sm:p-6 rounded-lg border-[1.4px] dark:border-neutral-600 dark:focus:border-orange-400 dark:bg-neutral-800 bg-slate-50">
//                     {/* MCQ */}
//                     <div className='flex flex-col gap-2 w-full'>
//                         {/* question */}
//                         <div className=" question flex items-center gap-2 w-full">
//                             <label htmlFor={`question_${index + 1}`}>Q{index + 1}.</label>
//                             <input
//                                 type="text"
//                                 name={`mc_question_${index}`}
//                                 value={mcq.question}
//                                 id={`question_${index + 1}`}
//                                 autoComplete='off'
//                                 placeholder="Enter question"
//                                 className="border-b-[1.4px] dark:border-neutral-600 dark:focus:border-orange-400 bg-transparent px-2 py-1 focus:border-orange-400 outline-none border-gray-300 w-full"
//                                 onChange={(e) => handleChange(e, index)}
//                             />
//                         </div>
//                         {errors[`question_${index}`]?.question && <p className="text-red-500 text-xs mt-2">{errors[`question_${index}`]?.question}</p>}
//                         {/* options */}
//                         <div className="options pl-3 md:pl-10 flex flex-col gap-2">
//                             {mcq.options.map((option, optIndex) => (
//                                 <div key={optIndex} className="flex items-center gap-2 w-full">
//                                     <label htmlFor={`option_${optIndex + 1}`}>{String.fromCharCode(65 + optIndex)}</label>
//                                     <input
//                                         type="text"
//                                         name={`mc_${optIndex}_${index}`}
//                                         value={option}
//                                         id={`option_${optIndex + 1}`}
//                                         autoComplete='off'
//                                         placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
//                                         className="border-[1.4px] dark:border-neutral-600 dark:focus:border-orange-400 bg-transparent px-2 py-1 rounded focus:border-orange-400 outline-none border-gray-300 w-full"
//                                         onChange={(e) => handleChange(e, index)}
//                                     />
//                                 </div>

//                             ))}
//                             {errors[`question_${index}`]?.option && <p className="text-red-500 text-xs mt-2">{errors[`question_${index}`]?.option}</p>}
//                         </div>
//                         {/* <div className="correct_option flex items-center gap-2">
//                         <label className='' htmlFor={`correctAnswer_${index}`}>Correct Option</label>
//                         <input
//                             type="text"
//                             name={`mc_correctAnswer_${index}`}
//                             value={mcq.correctAnswer}
//                             placeholder="Enter correct option"
//                             className="border-b-[1.4px] px-2 py-1 focus:border-orange-400 outline-none border-gray-300 "
//                             onChange={(e) => handleChange(e, index)}
//                         />
//                     </div> */}
//                         <select
//                             name={`mc_correctAnswer_${index}`}
//                             value={mcq.correctAnswer}
//                             onChange={(e) => handleChange(e, index)}
//                             className="border-[1.4px] dark:border-neutral-600 dark:focus:border-orange-400 dark:bg-neutral-800  p-1 rounded focus:border-orange-400 outline-none bg-transparent border-gray-300"
//                         >
//                             <option value="">Select correct option</option>
//                             {mcq.options.map((option, optIndex) => (
//                                 <option key={optIndex} value={option}>
//                                     {`${String.fromCharCode(65 + optIndex)} : ${option}`}
//                                 </option>
//                             ))}
//                         </select>
//                         {errors[`question_${index}`]?.correctAnswer && (
//                             <p className="text-red-500 text-xs mt-2">{errors[`question_${index}`]?.correctAnswer}</p>
//                         )}

//                         {errors[`question_${index}`]?.marks && <p className="text-red-500 text-xs mt-2">{errors[`question_${index}`]?.marks}</p>}
//                     </div>
//                     {/* Modify */}
//                     <div className="modify flex flex-col gap-2 items-end">
//                         {/* <button className="edit bg-[#FF4F1F] text-white w-20 h-9 rounded ">Edit</button> */}
//                         <div className='flex md:flex-col flex-row gap-2 items-center md:items-start'><label htmlFor=''>Marks</label>
//                             <input
//                                 type="number"
//                                 name={`marks_${index}`}
//                                 value={mcq.marks}
//                                 placeholder="Enter marks"
//                                 onChange={(e) => handleChange(e, index)}
//                                 className="border-[1.4px] dark:border-neutral-600 dark:focus:border-orange-400 bg-transparent px-2 py-1 rounded focus:border-orange-400 outline-none border-gray-300"
//                             /></div>
//                         <button onClick={(e) => { e.preventDefault(); handleDeleteQuestion(index) }} className="delete bg-[#FF4F1F] hover:bg-[#e64400] text-white w-20 h-9 rounded-md ">Delete</button>
//                     </div>
//                 </motion.div>
//             ))}
//         </div>
//     </AnimatePresence>
//     <button
//         type="button"
//         onClick={handleAddQuestion}
//         className="bg-[#FF4F1F] hover:bg-[#e64400] text-white w-24 h-9 rounded-md mt-4"
//     >
//         Add MCQ
//     </button>
//     <button type="submit" className="bg-[#FF4F1F] hover:bg-[#e64400] text-white w-20 h-9 rounded-md">
//         Submit
//     </button>
// </form>