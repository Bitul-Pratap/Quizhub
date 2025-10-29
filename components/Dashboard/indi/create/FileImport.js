"use client"

import { useState, useCallback } from "react"
import { Upload, FileText, ImageIcon, Edit, Trash2, Plus, Save, X } from "lucide-react"
import Modal from '@/components/Modal'

export function FileImport({ onAddMultipleQuestions }) {
    const [isDragOver, setIsDragOver] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [files, setFiles] = useState([])
    const [uploadedFile, setUploadedFile] = useState(null)
    const [uploading, setUploading] = useState(false);
    const [extractedQuestions, setExtractedQuestions] = useState([])
    const [showPreview, setShowPreview] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [editingQuestion, setEditingQuestion] = useState(null)
    const [errors, setErrors] = useState({})
    const [showModal, setShowModal] = useState(false)

    const handleDragOver = useCallback((e) => {
        e.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e) => {
        e.preventDefault()
        setIsDragOver(false)
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        setIsDragOver(false)
        ModalHandler();
        return;
        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            handleFileUpload(files[0])
        }
    }, [])


    const handleFileUpload = async (file) => {
        setUploadedFile(file)
        setIsProcessing(true)
        setShowPreview(false)
        await new Promise((resolve) => setTimeout(resolve, 3000))
        const mockQuestions = [
            {
                question: `Question extracted from ${file.name}: What is the main topic discussed?`,
                options: ["Correct answer from document", "Incorrect option A", "Incorrect option B", "Incorrect option C"],
                correctAnswer: 0,
                explanation: "This answer was extracted from the uploaded document.",
                source: "import",
                id: Date.now().toString(),
            },
            {
                question: `Another question from ${file.name}: What is the secondary concept?`,
                options: ["Wrong answer", "Correct answer from file", "Another wrong option", "Yet another wrong option"],
                correctAnswer: 1,
                explanation: "This information was found in the imported content.",
                source: "import",
                id: (Date.now() + 1).toString(),
            },
        ]
        setExtractedQuestions(mockQuestions)
        setIsProcessing(false)
        setShowPreview(true)
    }

    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileUpload(file)
        }
    }


    const validateQuestion = () => {
        const newerrors = {};
        if (!editingQuestion.question?.trim()) {
            newerrors.question = "Question is required.";
        }
        if (!editingQuestion.options.every(opt => typeof opt === 'string' && opt.trim() !== '')) {
            newerrors.options = "Option cannot be empty.";
        }
        if (!(editingQuestion.correctAnswer + 1)) {
            newerrors.correctAnswer = "Correct answer is required.";
        }
        setErrors(newerrors);
        return Object.keys(newerrors).length === 0;
    }

    const handleAddToQuiz = () => {
        onAddMultipleQuestions(extractedQuestions)
        setExtractedQuestions([])
        setShowPreview(false)
        setUploadedFile(null)
    }

    const handleRemoveQuestion = (index) => {
        setExtractedQuestions((prev) => prev.filter((_, i) => i !== index))
    }

    const getFileIcon = (fileName) => {
        const extension = fileName.split(".").pop()?.toLowerCase()
        if (["jpg", "jpeg", "png", "gif"].includes(extension || "")) {
            return <ImageIcon className="h-8 w-8 text-blue-500" />
        }
        return <FileText className="h-8 w-8 text-green-500" />
    }


    const handleEdit = (question) => {
        setEditingId(question.id)
        setEditingQuestion({ ...question })
    }

    const updateQuestion = (id, updatedQuestion) => {
        setExtractedQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updatedQuestion } : q)))
    }

    const handleSave = () => {
        if (editingQuestion && editingId) {
            if (!validateQuestion()) return;
            updateQuestion(editingId, editingQuestion)
            setEditingId(null)
            setEditingQuestion(null)
        }
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditingQuestion(null)
    }


    // Simple skeleton loader
    const Skeleton = ({ className }) => (
        <div className={`bg-slate-200 dark:bg-slate-700 rounded animate-pulse ${className}`} />
    )


    const handleFileChange = (e) => {
        e.preventDefault();
        if (e.target.files) {
            const selected = Array.from(e.target.files);
            console.log('Selected files:', selected);
            setFiles(selected);
            handleUpload(e, selected);
        }
    };

    const handleUpload = async (e, selectedFiles) => {
        e.preventDefault();
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append('files', file));
        // for (let pair of formData.entries()) {
        //     console.log(pair[0], pair[1]);
        // }
        console.log([...formData.entries()]);
        setUploading(true);

        const res = await fetch('/api/quiz/import-files/upload', {
            method: 'POST',
            body: formData,
        });

        setUploading(false);
        const result = await res.json();
        console.log('Uploaded:', result);
    };

    const ModalHandler = () => {
        setShowModal(true);
        return;
    }


    return (
        <>
        {/* Modal for file import */}
        {showModal && (
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg" type="info" 
                title="Under development"
                content={<>
                    <p className="mb-2">The file import feature is currently under development and will be available soon. Stay tuned for updates!</p>
                    <span role="img" aria-label="smile" className="text-xl">🚧👷‍♂️🚧</span>
                </>}
            />
        )}
        <div className="space-y-6">
            {/* Card */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700 rounded-lg shadow-sm">
                <div className="p-6 border-blue-100 dark:border-blue-700">
                    <div className="flex flex-shrink-0 items-center space-x-2 text-2xl leading-none tracking-tight font-semibold">
                        <Upload className="h-5 w-5 text-blue-600" />
                        <span>Import from File or Image</span>
                        <div className="hidden sm:block ml-2 px-2.5 py-0.5 tracking-normal rounded-full text-xs bg-blue-100 text-blue-700 font-semibold">AI-Powered</div>
                    </div>
                </div>
                <div className="p-6 pt-0">
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragOver ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20" : "border-slate-300 dark:border-slate-600"
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("file-upload").click()}
                    >
                        <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                        <h3 className="text-lg font-medium mb-2">Drop files here or click to upload</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">Supports PDF, DOCX, JPG, PNG files</p>
                        <input
                            type="file"
                            multiple
                            accept=".pdf,.docx,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                            disabled
                        />
                        <button
                            // htmlFor="file-upload"
                            onClick={ModalHandler}
                            className="inline-block px-4 py-2 border border-slate-300 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                            Choose File
                        </button>
                    </div>
                    {files.map((file, idx) => (
                        <div key={idx} className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center space-x-3">
                            {getFileIcon(file.name)}
                            <div className="flex-1">
                                <p className="font-medium">{file.name}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            {isProcessing && (
                                <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">Processing...</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Processing State */}
            {isProcessing && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                    <div className="p-6 ">
                        <div className="text-xl font-semibold">AI is analyzing your file...</div>
                    </div>
                    <div className="p-6 pt-0 space-y-4">
                        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span>Extracting content from document</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "200ms" }}></div>
                            <span>Identifying potential questions</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "400ms" }}></div>
                            <span>Generating answer options</span>
                        </div>
                        <div className="space-y-3 mt-6">
                            {[1, 2].map((i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Extracted Questions */}
            {showPreview && extractedQuestions.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                    <div className="p-6 flex items-center justify-between">
                        <span className="text-xl font-semibold">Extracted Questions Preview</span>
                        <span className="px-2.5 py-0.5 font-semibold rounded-full border border-slate-300 text-xs">{extractedQuestions.length} questions found</span>
                    </div>
                    <div className="p-6 pt-0 space-y-4">
                        {extractedQuestions.map((q, index) => (
                            <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <h4 className="font-medium text-sm text-slate-600 dark:text-slate-400">Question {index + 1}</h4>
                                        <div className="flex space-x-1">
                                            <button
                                                className="px-3 h-9 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                                                onClick={() => handleEdit(q)}
                                                disabled={editingId === q.id}
                                                title="Edit"
                                                type="button"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="px-3 h-9 rounded-md hover:bg-red-100 dark:hover:bg-red-900 text-red-500 hover:text-red-700"
                                                onClick={() => handleRemoveQuestion(index)}
                                                title="Remove"
                                                type="button"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {editingId === q.id ? (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={editingQuestion.question}
                                                onChange={(e) =>
                                                    setEditingQuestion({
                                                        ...editingQuestion,
                                                        question: e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border rounded-md text-sm"
                                            />
                                            {editingQuestion.options.map((option, optIndex) => (
                                                <div key={optIndex} className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        checked={editingQuestion.correctAnswer === optIndex}
                                                        onChange={() =>
                                                            setEditingQuestion({
                                                                ...editingQuestion,
                                                                correctAnswer: optIndex,
                                                            })
                                                        }
                                                        className="text-orange-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => {
                                                            const newOptions = [...editingQuestion.options]
                                                            newOptions[optIndex] = e.target.value
                                                            setEditingQuestion({
                                                                ...editingQuestion,
                                                                options: newOptions,
                                                            })
                                                        }}
                                                        className="w-full px-3 py-2 border rounded-md text-sm"
                                                    />
                                                </div>
                                            ))}
                                            <input
                                                type="text"
                                                value={editingQuestion.explanation}
                                                onChange={(e) =>
                                                    setEditingQuestion({
                                                        ...editingQuestion,
                                                        explanation: e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border rounded-md text-sm"
                                            />

                                            {Object.keys(errors).length > 0 && (
                                                <div className="text-red-500 text-xs my-1">
                                                    {errors.question && (
                                                        <div>{errors.question}</div>
                                                    )}
                                                    {errors.options && (
                                                        <div>{errors.options}</div>
                                                    )}
                                                    {errors.correctAnswer && (
                                                        <div>{errors.correctAnswer}</div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex space-x-2">
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2 px-3 h-9 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm whitespace-nowrap font-medium"
                                                    onClick={handleSave}
                                                >
                                                    <Save className="h-4 w-4 mr-1" />
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2 px-3 h-9 rounded-md border border-slate-300 dark:border-slate-700 text-sm whitespace-nowrap font-medium"
                                                    onClick={handleCancel}
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="font-medium mb-2">{q.question}</p>
                                            <div className="space-y-1 text-sm">
                                                {q.options.map((option, optIndex) => (
                                                    <div
                                                        key={optIndex}
                                                        className={`p-2 rounded ${optIndex === q.correctAnswer
                                                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                                            : "bg-slate-50 dark:bg-slate-800"
                                                            }`}
                                                    >
                                                        {option}
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="font-medium mt-2">{q.explanation || ""}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div className="flex space-x-3 pt-4">
                            <button
                                onClick={handleAddToQuiz}
                                className="flex-1 flex items-center justify-center px-4 py-2 rounded-md bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold transition"
                                type="button"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add All to Quiz
                            </button>
                            <button
                                className="px-4 py-2 rounded-md border border-slate-300 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                onClick={() => setShowPreview(false)}
                                type="button"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    )
}
