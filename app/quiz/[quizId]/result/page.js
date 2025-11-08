'use server'
import React from 'react'
import ResultPage from '@/components/Dashboard/indi/ResultPage';

const Result = async({searchParams}) => {
    const quizId = (await searchParams).quizId;
    const userEmail = (await searchParams).userEmail;
    console.log(quizId, userEmail);
  return (
    // <div>ResultPage</div>
    <ResultPage quizId={quizId} userEmail={userEmail} />
  )
}

export default Result
