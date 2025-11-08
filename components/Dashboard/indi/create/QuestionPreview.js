import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Save, X, Plus, Minus } from 'lucide-react';


const TableHandler = ({ segment, isEditing = false, changeHandler = null }) => {
    // console.log(segment)
    const tableData = segment?.content;
    // console.log(tableData)
    const rows = tableData?.split("\n").map(row => row.split("|").map(cell => cell.trim()));
    const [table, setTable] = useState(rows || []);

    // When table state changes, notify parent via changeHandler (runs after render)
    useEffect(() => {
        if (!Array.isArray(table) || table.length === 0) return;
        const newContent = table.map(row => row.join(' | ')).join('\n');
        if (typeof changeHandler === 'function') {
            try {
                changeHandler(null, newContent);
            } catch (err) {
                // swallow errors from parent handlers during render lifecycle
                // console.log('TableHandler changeHandler error:', err);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [table]);

    function handleCellChange(rowIndex, cellIndex, value) {
        setTable(prevTable => {
            const newTable = prevTable.map(r => [...r]);
            newTable[rowIndex][cellIndex] = value;
            return newTable;
        });
    }
    return (
        <div className="overflow-x-auto pt-4 ">
            {isEditing ? (
                <>
                    <table className="w-full table-auto border-collapse border border-slate-200 dark:border-slate-700 ">
                        <tbody>
                            {table.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) =>
                                        rowIndex === 0 ? (
                                            <th key={cellIndex} className='border border-slate-200 dark:border-slate-700 font-semibold '>
                                                <input
                                                    type="text"
                                                    value={cell}
                                                    placeholder='Fill the Cell...'
                                                    onChange={(e) => handleCellChange(rowIndex, cellIndex, e.target.value)}
                                                    className="w-full px-3 py-1 text-sm  dark:bg-transparent/20 text-center ringOut-Set ringOut-var-1"
                                                />
                                            </th>
                                        ) : (
                                            <td key={cellIndex} className='border border-slate-200 dark:border-slate-700'>
                                                <input
                                                    type="text"
                                                    value={cell}
                                                    className={`w-full px-3 py-1 text-sm  dark:bg-transparent/20 text-center ringOut-Set ringOut-var-1`}
                                                    placeholder='Fill the Cell...'
                                                    onChange={(e) => handleCellChange(rowIndex, cellIndex, e.target.value)}
                                                />
                                            </td>
                                        )
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className='flex space-x-2 mt-2'>
                        <button
                            onClick={() => setTable([...table, Array(table[0].length).fill('')])}
                            className="px-3 py-1 flex items-center gap-1 text-xs border border-slate-200 dark:border-slate-700 rounded-md"
                        >
                            Row <Plus className="inline h-3 w-3" />
                        </button>
                        <button onClick={() => setTable(table.slice(0, -1))} className="px-3 py-1 flex items-center gap-1 text-xs border border-slate-200 dark:border-slate-700 rounded-md">
                            Row <Minus className="inline h-3 w-3" />
                        </button>
                        <button onClick={() => setTable(table.map(row => [...row, '']))} className="px-3 py-1 flex items-center gap-1 text-xs border border-slate-200 dark:border-slate-700 rounded-md">
                            Column <Plus className="inline h-3 w-3" />
                        </button>
                        <button onClick={() => setTable(table.map(row => row.slice(0, -1)))} className="px-3 py-1 flex items-center gap-1 text-xs border border-slate-200 dark:border-slate-700 rounded-md">
                            Column <Minus className="inline h-3 w-3" />
                        </button>
                    </div>
                </>
            ) : (
                <table className="w-full table-auto border-collapse  border border-slate-200 dark:border-slate-600">
                    <tbody>
                        {table.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) =>
                                    rowIndex === 0 ? (
                                        <th className="font-semibold border border-slate-200 dark:border-slate-600 text-center px-3 py-1" key={cellIndex}>
                                            {cell}
                                        </th>
                                    ) :
                                        (
                                            <td
                                                key={cellIndex}
                                                className={`border border-slate-200 dark:border-slate-600 px-3 py-1 text-center `}>
                                                {cell}
                                            </td>
                                        ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export const SegmentRenderer = ({ segment, isPreview = false, isEditing = false, isAttempting = false, changeHandler = null }) => {

    // console.log(segment);
    switch (segment.type) {
        case 'text':
            return (
                <div className="">
                    {isEditing ? (
                        <textarea
                            value={segment.content}
                            onChange={changeHandler}
                            placeholder='Enter text here...'
                            className="ringOut-Set ringOut-var-1 w-full px-3 py-2 border  border-slate-200 dark:border-slate-700 dark:bg-transparent/20 rounded-md text-sm"
                        />
                    ) : (
                        <p className={`font-medium ${isPreview ? "text-sm" : ""}`} >{segment.content}</p>
                    )}
                </div>
            );

        case 'image':
            return (
                <div className="">
                    {isEditing ? (
                        <>
                            <label
                                htmlFor="file-upload"
                                className="inline-block px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-transparent/20 text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                                Choose File
                            </label>
                            <input type="file" accept="image/*" onChange={changeHandler} className='hidden' />
                        </>
                    ) : (
                        <img src={segment.content} alt="Question image" className="max-w-full h-auto rounded-md" />
                    )}
                </div>
            );
        case 'code':
            return (
                <div className="font-medium ">
                    {isEditing ? (
                        <textarea value={segment.content} placeholder='Enter code here...' onChange={changeHandler} className="ringOut-Set ringOut-var-1 w-full font-mono bg-slate-100 dark:bg-slate-800 px-3 py-2  rounded-md text-sm" />
                    ) : (
                        <pre className='bg-slate-100 dark:bg-slate-800 p-3 rounded-md overflow-x-auto'>
                            <code className={`text-sm language-${segment.language}`} >{segment.content}</code>
                        </pre>
                    )}
                </div>
            );
        case 'table':
            return <TableHandler segment={segment} isEditing={isEditing} changeHandler={changeHandler} />;

        case 'math':
            return (
                <div className="font-medium ">
                    {isEditing ? (
                        <textarea value={segment.content} placeholder='Enter math expression...' onChange={changeHandler} className="ringOut-Set ringOut-var-1 w-full px-3 py-2 border rounded-md border-slate-200 dark:border-slate-700 dark:bg-transparent/20 text-sm" />
                    ) : (
                        <pre className='bg-slate-100 dark:bg-slate-800 p-3 rounded-md overflow-x-auto'>
                            <code className={`text-sm language-${segment.language}`} >{segment.content}</code>
                        </pre>
                    )}
                </div>
            );
        default:
            return null;
    }
}

export const Toolbar = ({ handleToolbar }) => {

    const toolbar = [
        { type: "text", label: "Text" },
        { type: "code", label: "Code" },
        // { type: "image", label: "Image" },
        { type: "table", label: "Table" },
        { type: "math", label: "Math" },
    ]

    return (
        <div className={`w-fit px-3 py-2 text-sm bg-gradient-to-t from-blue-50/80 to-blue-50/20 dark:from-transparent/50 border dark:border-slate-700 shadow-sm  rounded-md border-blue-200 flex gap-2`}>
            {toolbar.map((tool, idx) => (
                <button
                    key={idx}
                    onClick={(e) => handleToolbar(e, tool.type)}
                    className="px-1 bg-gradient-to-br from-blue-400 to-blue-700 tracking-tight bg-clip-text text-transparent rounded-md hover:from-blue-500 hover:bg-blue-700 focus:outline-1 focus:outline-offset-2 dark:focus:outline-blue-500 focus:outline-blue-500">
                    {tool.label}
                </button>
            ))}
        </div>
    )
}

export function QuestionPreview({ question, index, isPreview = false, setGeneratedQuestions = null, updateQuestion = null, removeQuestion = null }) {

    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState({});
    const [editingQuestion, setEditingQuestion] = useState(null);


    const handleToolbar = (e, type) => {
        e.preventDefault();
        const newSegment = { type, content: '', language: 'plaintext' };
        if (type === 'table') {
            newSegment.content = "| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |";
        }
        setEditingQuestion((prev) => ({
            ...prev,
            questionText: [...prev.questionText, newSegment]
        }));
    }

    const handleEdit = () => {
        setIsEditing(true);
        setEditingQuestion(question);
    }

    const handleRemoveQuestion = (index) => {
        setGeneratedQuestions((prev) => prev.filter((_, i) => i !== index))
    }

    const validateQuestion = () => {
        const newerrors = {};

        if (!editingQuestion.questionText || editingQuestion.questionText.length === 0 || !editingQuestion.questionText.some(segment => segment.content.trim() !== '')) {
            newerrors.questionText = "Question text is required.";
        }

        if (!editingQuestion.options.every(opt => typeof opt === 'string' && opt.trim() !== '')) {
            newerrors.options = "Option cannot be empty.";
        }
        if (!(editingQuestion.correctOption + 1)) {
            newerrors.correctOption = "Correct answer is required.";
        }
        if (editingQuestion.marks === undefined ||
            editingQuestion.marks === null ||
            editingQuestion.marks === "") {
            newerrors.marks = "Marks are required.";
        }

        setErrors(newerrors);
        return Object.keys(newerrors).length === 0;
    }

    const handleUpdateQuestion = (id, updatedQuestion) => {
        setGeneratedQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updatedQuestion } : q)))
    }


    const handleSave = () => {
        if (isEditing) {
            if (!validateQuestion()) return;
            const filteredQuestion = editingQuestion.questionText.filter(segment => segment.content.trim() !== '');
            setEditingQuestion({ ...editingQuestion, questionText: filteredQuestion });
            isPreview ? updateQuestion(editingQuestion.id, editingQuestion) : (handleUpdateQuestion(editingQuestion.id, editingQuestion));
            setIsEditing(false);
        }
    }

    const handleCancel = () => {
        setIsEditing(false);
        setEditingQuestion
        setErrors({})
    }

    const segmentChangeHandler = (e, value, segment, index) => {
        // console.log(e, value, segment);
        const newQuestionText = [...editingQuestion.questionText];
        newQuestionText[index] = { ...segment, content: segment.type !== 'table' ? e.target.value : value };
        setEditingQuestion({ ...editingQuestion, questionText: newQuestionText });
    }


    return (
        <div className="p-3 sm:p-6 pt-4">
            <div className="flex items-start justify-between mb-3">
                <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-medium text-sm text-slate-600 dark:text-slate-400"> {isPreview ? "Q" : "Question"} {index + 1}</h4>
                    <span className={`px-2.5 py-0.5 rounded-full ${isPreview ? "text-xs" : "text-xs sm:text-sm"} text-slate-500 dark:text-slate-400 bg-slate-100 font-semibold dark:bg-slate-800 `}>
                        {(question.marks === null || question.marks === undefined) ? "No marks assigned" : `${question.marks} marks`}
                    </span>
                </div>
                <div className="flex space-x-1">
                    <button
                        className="px-2 sm:px-3 h-9 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                        title="Edit"
                        type="button"
                        onClick={() => handleEdit()}
                        tabIndex={-1}
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    <button
                        className="px-2 sm:px-3 h-9 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => isPreview ? removeQuestion(question.id) : handleRemoveQuestion(index)}
                        type="button"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    <div className='space-y-2 relative'>
                        {(editingQuestion.questionText.map((segment, index) => {
                            return (
                                <div className='relative' key={index}>
                                    <SegmentRenderer
                                        key={index}
                                        segment={segment}
                                        isPreview={isPreview}
                                        isEditing={isEditing}
                                        changeHandler={(e, value) => segmentChangeHandler(e, value, segment, index)}
                                    />
                                    <button
                                        onClick={() => {
                                            const newQuestionText = editingQuestion.questionText.filter((_, i) => i !== index);
                                            setEditingQuestion({ ...editingQuestion, questionText: newQuestionText });
                                        }}
                                        className='absolute bg-red-500 hover:bg-red-600 dark:bg-red-700 hover:dark:bg-red-600 text-white right-0 top-0 p-1 py-[2px] rounded-tr-md rounded-bl-sm '>
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )
                        }))}
                    </div>

                    {/* Toolbar */}
                    <Toolbar handleToolbar={handleToolbar} />


                    {editingQuestion.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2">
                            <input
                                type="radio"
                                checked={editingQuestion.correctOption === optIndex}
                                onChange={() =>
                                    setEditingQuestion({ ...editingQuestion, correctOption: optIndex })
                                }
                                className="text-orange-500"
                            />
                            <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                    const newOptions = [...editingQuestion.options]
                                    newOptions[optIndex] = e.target.value
                                    setEditingQuestion({ ...editingQuestion, options: newOptions })
                                }}
                                className={`w-full px-3 py-2 border dark:border-slate-700 dark:bg-transparent/10   rounded-md ${isPreview ? "text-xs" : "text-sm"} ringOut-Set ringOut-var-1`}
                                placeholder={`Option ${optIndex + 1}`}
                            />
                            {editingQuestion.options.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newOptions = [...editingQuestion.options]
                                        newOptions.splice(optIndex, 1)
                                        setEditingQuestion({ ...editingQuestion, options: newOptions })
                                    }}
                                    className="text-[#ef4444] font-bold cursor-pointer"
                                    title="Remove option"
                                >
                                    <Trash2 className='w-4 h-4' />
                                </button>
                            )}
                        </div>
                    ))}
                    {editingQuestion.options.length < 6 && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingQuestion({
                                    ...editingQuestion,
                                    options: [...editingQuestion.options, '']
                                })
                            }}
                            className="w-full py-2 mt-2 flex items-center justify-center gap-4 rounded-md border border-slate-200 dark:border-slate-700"
                        >
                            <Plus className="w-4 h-4 font-bold" /> Add Option
                        </button>
                    )}

                    <textarea
                        rows={4}
                        value={editingQuestion.explanation}
                        onChange={(e) =>
                            setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                        }

                        className="ringOut-Set ringOut-var-1 w-full px-3 py-2 border  dark:border-slate-700 dark:bg-transparent/10 rounded-md text-sm"
                        placeholder="Enter explanation here..."
                    />

                    <input
                        type="number"
                        value={editingQuestion.marks ?? ''}
                        onChange={(e) =>
                            setEditingQuestion({ ...editingQuestion, marks: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 border  dark:border-slate-700 dark:bg-transparent/10 rounded-md text-sm ringOut-Set ringOut-var-1"
                        placeholder="Enter marks"
                        min={0}
                    />

                    {Object.keys(errors).length > 0 && (
                        <div className="text-red-500 text-xs my-1">
                            {errors.questionText && (
                                <div>{errors.questionText}</div>
                            )}
                            {errors.options && (
                                <div>{errors.options}</div>
                            )}
                            {errors.correctOption && (
                                <div>{errors.correctOption}</div>
                            )}
                            {errors.marks && (
                                <div>{errors.marks}</div>
                            )}
                        </div>)}

                    <div className="flex space-x-2">
                        <button
                            type="button"
                            className="flex items-center gap-1 sm:gap-2 px-3 h-9 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm whitespace-nowrap font-medium"
                            onClick={handleSave}
                        >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-1 sm:gap-2 px-3 h-9 rounded-md border border-slate-300 dark:border-slate-700 text-sm whitespace-nowrap font-medium"
                            onClick={handleCancel}
                        >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className={`mb-4 space-y-1 ${isPreview ? "text-sm" : ""}`}>
                        {(question.questionText.map((segment, index) => {
                            return (
                                <SegmentRenderer
                                    key={index}
                                    segment={segment}
                                    isPreview={isPreview}
                                    isEditing={isEditing}
                                />
                            );

                            // if (segment.type === "image") {
                            //     return (
                            //         <div key={index} className="mb-2">
                            //             <img
                            //                 src={segment.content}
                            //                 alt={`Image ${index + 1}`}
                            //                 className="max-w-full h-auto rounded-md"
                            //             />
                            //         </div>
                            //     );
                            // }

                            // if (segment.type !== "text" && segment.type !== "image") {
                            //     return (
                            //         <div key={index} className="font-medium mb-2">
                            //             <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md overflow-x-auto">
                            //                 <code className={`text-sm language-${segment.lang}`}>{segment.content ?? ""}</code>
                            //             </pre>
                            //         </div>
                            //     );
                            // } else {
                            //     return (
                            //         <p key={index} className={`font-medium mb-2 whitespace-pre-line ${isPreview ? "text-sm" : ""}`}>{segment.content}</p>
                            //     );
                            // }
                        }))}
                    </div>
                    <div className={`space-y-1 ${isPreview ? "text-xs" : "text-sm"}`}>
                        {question.options.map((option, optIndex) => (
                            <div
                                key={optIndex}
                                className={`p-2 rounded whitespace-pre-line ${optIndex === question.correctOption
                                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                    }`}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                    <p className={`text-slate-600 dark:text-slate-400 mt-2 ${isPreview ? "text-sm" : ""}`}>{question.explanation}</p>
                </>
            )}

        </div>
    )
}