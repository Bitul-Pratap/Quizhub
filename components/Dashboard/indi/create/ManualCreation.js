"use client"

import { Plus, Trash2, X } from "lucide-react"
import { useState } from "react"
import { Toolbar, SegmentRenderer } from "./QuestionPreview"

export function ManualCreation({ onAddQuestion }) {
    const [questionText, setQuestionText] = useState([
        { type: "text", content: "" },
    ])
    const [options, setOptions] = useState(["", "", "", ""])
    const [correctOption, setcorrectOption] = useState(0)
    const [explanation, setExplanation] = useState("")
    const [marks, setMarks] = useState(0);
    const [errors, setErrors] = useState({})

    const handleToolbar = (type) => {
        const newSegment = { type, content: '', language: (type === 'code' && "plaintext") };
        if (type === 'table') {
            newSegment.value = "| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |";
        }
        setQuestionText((prev) => ([
            ...prev,
            newSegment
        ]));
    }

    const handleSegmentChange = (index, e) => {
        const newQuestionText = [...questionText];
        newQuestionText[index] = {
            ...newQuestionText[index],
            content: e.target.value
        }
        setQuestionText(newQuestionText);
    }

    const validate = () => {
        const errs = {}
        if (!questionText || questionText.length === 0 || !questionText.some((seg) => seg.content.trim())) errs.questionText = "Question is required."
        if (options.some((opt) => !opt.trim())) errs.options = "All options are required."
        if (options.length < 2) errs.options = "At least 2 options are required."
        if (
            Number.isNaN(Number.parseInt(correctOption)) ||
            !options[Number.parseInt(correctOption)]?.trim()
        ) {
            errs.correctOption = "Select a valid correct answer."
        }
        return errs
    }

    const handleAddOption = () => {
        setOptions([...options, ""])
    }

    const handleRemoveOption = (index) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index)
            setOptions(newOptions)
            if (Number.parseInt(correctOption) >= newOptions.length) {
                setcorrectOption("0")
            }
        }
    }

    const handleOptionChange = (index, value) => {
        const newOptions = [...options]
        newOptions[index] = value
        setOptions(newOptions)
    }

    const handleSubmit = () => {
        const errs = validate()
        setErrors(errs)
        if (Object.keys(errs).length === 0) {
            const newQuestion = {
                id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
                questionText: questionText,
                options: options.filter((opt) => opt.trim()),
                correctOption: Number.parseInt(correctOption),
                explanation: explanation.trim() || undefined,
                marks: Number.isNaN(Number.parseInt(marks)) ? undefined : Number.parseInt(marks),
                source: "manual",
            }
            console.log(newQuestion)
            onAddQuestion(newQuestion)
            setQuestionText([
                { type: "text", content: "" },
            ])
            setOptions(["", "", "", ""])
            setcorrectOption("0")
            setExplanation("")
            setErrors({})
        }
    }

    return (
        <div className="bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm  text-slate-900 dark:text-slate-100">
            <h2 className="font-bold text-2xl mb-4">Create Question Manually</h2>
            <div className="mb-4">
                <label htmlFor="question" className="block text-sm font-medium mb-2">Question</label>
                <div className="space-y-2 relative">
                    {questionText.map((segment, index) => (
                        <div className="relative" key={index}>
                            <SegmentRenderer segment={segment} isEditing={true} changeHandler={(e) => handleSegmentChange(index, e)} />
                            <button
                                onClick={() => {
                                    const newQuestionText = questionText.filter((_, i) => i !== index);
                                    setQuestionText(newQuestionText);
                                }}
                                className='absolute bg-red-500 hover:bg-red-600 dark:bg-red-700 hover:dark:bg-red-600 text-white right-0 top-0 p-1 py-[2px] rounded-tr-md rounded-bl-sm '>
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                    <Toolbar handleToolbar={handleToolbar} />
                    {errors.questionText && (
                        <div className="text-red-500 text-xs mt-1">{errors.questionText}</div>
                    )}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm mb-1">Options</label>
                {options.map((option, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <label htmlFor={`option-${index}`} className="mr-2">
                            <input
                                type="radio"
                                name="correctOption"
                                value={index}
                                checked={correctOption === index}
                                onChange={() => setcorrectOption(index)}
                                className="hidden peer cursor-pointer"
                                id={`option-${index}`}
                            />

                            <span
                                className="w-4 h-4 rounded-full border-[1.4px] border-slate-300/80 flex items-center justify-center peer-checked:border-transparent  transition-colors mr-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        setcorrectOption(index);
                                    }
                                }}
                            >
                                {correctOption === index && (
                                    <span className="w-4 h-3.5 bg-blue-500  rounded-full block" />
                                )}
                            </span>
                        </label>

                        <input
                            type="text"
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className=" ringOut-Set ringOut-var-1 text-sm flex-1 p-2 border border-slate-200 dark:border-slate-700 dark:bg-transparent/20 rounded-md mr-2"
                        />
                        {options.length > 2 && (
                            <button
                                type="button"
                                onClick={() => handleRemoveOption(index)}
                                className="text-[#ef4444] font-bold cursor-pointer"
                                title="Remove option"
                            >
                                <Trash2 className='w-4 h-4' />
                            </button>
                        )}
                    </div>
                ))}
                {errors.options && (
                    <div className="text-red-500 text-xs mt-1">{errors.options}</div>
                )}
                {errors.correctOption && (
                    <div className="text-red-500 text-xs mt-1">{errors.correctOption}</div>
                )}
                {options.length < 6 && (
                    <button
                        type="button"
                        onClick={handleAddOption}
                        className="w-full py-2 mt-2 flex items-center justify-center gap-4 rounded-md border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm"
                    >
                        <Plus className="w-3 h-3 font-bold" /> Add Option
                    </button>
                )}
            </div>

            <div className="mb-4">
                <label htmlFor="explanation" className="block text-sm mb-2">
                    Explanation (Optional)
                </label>
                <textarea
                    id="explanation"
                    placeholder="Provide an explanation for the correct answer..."
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="ringOut-Set ringOut-var-1 w-full min-h-[60px] p-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-transparent/20 rounded-md"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="marks" className="block text-sm mb-2">
                    Marks
                </label>
                <input
                    type="number"
                    id="marks"
                    placeholder="Enter marks for the question..."
                    value={marks}
                    min={0}
                    onChange={(e) => setMarks(Number.parseInt(e.target.value))}
                    className="ringOut-Set ringOut-var-1 w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-transparent/20 rounded-md"
                />
            </div>

            <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-orange-500  to-orange-600 text-white rounded-md py-2 cursor-pointer opacity-100"
            >
                Add Question
            </button>
        </div>
    )
}
