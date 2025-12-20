import React from 'react'
import ResultPage from '@/components/Dashboard/indi/ResultPage';

export const metadata = {
    title: "Quiz Result",
    robots: {
        index: false,
    },
};

const Result = async({ params, searchParams}) => {
    const quizId = (await params).quizId;
    const userEmail = (await searchParams).userEmail;
    // console.log(quizId, userEmail);
  return (
    // <div>ResultPage</div>
    <ResultPage quizId={quizId} userEmail={userEmail} />
  )
}

export default Result
