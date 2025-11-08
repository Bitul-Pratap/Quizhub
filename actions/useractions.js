"use server"

import connectDB from "@/db/connectDb";
import Quiz from "@/models/Quiz";
import User from "@/models/User";
import QuizAttempt from "@/models/QuizAttempt";
import { nanoid } from "nanoid";
import Organization from "@/models/Organization";
import bcrypt from 'bcrypt';


export const registerUser = async (data) => {
  await connectDB();
  // console.log(data);
  let u = await User.findOne({ email: data.email });
  if (u) {
    return { status: false, message: "User already registered" };
  }
  else {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    let u = await User.create({
      email: data.email,
      name: data.name,
      phone: data.phone,
      password: hashedPassword,
      user_type: [{ type: data.regType, rights: data.regType === "Individual" ? "admin" : data.userType }],
    })
    // console.log("Created u", u);
    let user = u.toObject(({ flattenObjectIds: true }));
    return { status: true, message: 'Registration successful', data: user };
  }
}



export const fetchUser = async (email) => {
  await connectDB();
  let u = await User.findOne({ email: email, });
  if (!u) return { error: "User does not exist." };
  else {
    let user = u.toObject(({ flattenObjectIds: true }));
    // console.log(user);
    return user;
  }
}

const sanitizeQuizzes = async (quizzes) => {
  const sanitizedQuizzes = quizzes.map(quiz =>
    quiz.toObject({ flattenObjectIds: true })
  );
  return sanitizedQuizzes;
}

export const fetchQuizInfo = async (userId) => {
  await connectDB();
  const quizzes = await Quiz.find({ creater: userId }).select('quizId title subject createdAt endDate').exec();
  const sanitizedQuizzes = await sanitizeQuizzes(quizzes);
  // console.log(sanitizedQuizzes);
  return sanitizedQuizzes;
}

export const fetchQuizData = async (quizId) => {
  await connectDB();
  let quiz = await Quiz.findOne({ quizId: quizId });
  if (quiz) {
    quiz = quiz.toObject({ flattenObjectIds: true });
    // console.log(quiz);
    return quiz;
  }
  else {
    return { error: "Quiz is not present" };
  }
}

export const storeQuizData = async (quizData) => {
  try {
    // Validate that the data includes necessary fields
    if (!quizData.creater || !quizData.title || !quizData.subject || !quizData.questions || quizData.questions.length === 0) {
      throw new Error('Missing required fields: title, subject, or questions');
    }

    await connectDB();

    const existingQuiz = await Quiz.findOne({
      creater: quizData.creater,
      title: quizData.title,
      subject: quizData.subject,
    });

    if (existingQuiz) {
      return { success: false, message: 'A quiz with the same title and subject already exists.' };
    }

    let quizId = nanoid();

    // Create a new Quiz document based on the passed quizData
    let newQuiz = await Quiz.create({
      quizId: quizId,
      creater: quizData.creater,
      title: quizData.title,
      subject: quizData.subject,
      endless: quizData.endless || false, // Default to false if not provided
      endDate: quizData.endless ? null : quizData.endDate, // Set to null if "endless" is true
      questions: quizData.questions, // Array of questions with options
    });

    newQuiz = newQuiz.toObject({ flattenObjectIds: true });
    // console.log(newQuiz);

    // Save the new quiz document to the database
    // const savedQuiz = await newQuiz.save();

    return { success: true, message: 'Quiz successfully created!', data: newQuiz };
    //   console.log('Quiz saved successfully:', savedQuiz);
    // return savedQuiz; // Return the saved quiz document

  } catch (err) {
    console.error('Error saving quiz data:', err.message);
    return { success: false, message: 'An error occurred while saving the quiz data.' };
  }
};

export const updateQuiz = async (quizId, updatedQuizData) => {

  try {
    await connectDB(); // Connect to the database
    // Find the existing quiz by quizId
    const existingQuiz = await Quiz.findOne({ quizId });

    if (!existingQuiz) {
      throw new Error('Quiz not found');
    }

    //Find if another quiz with the same title exists
    const otherQuiz = await Quiz.findOne({ creater: updatedQuizData.creater, subject: updatedQuizData.subject, title: updatedQuizData.title });
    if (otherQuiz && otherQuiz._id.toString() !== existingQuiz._id.toString()) {
      throw new Error('Quiz with the same title already exists');
    }
    // Extract existing question IDs
    // const existingQuestionIds = existingQuiz.questions.map((q) => q._id.toString());

    // console.log(updatedQuizData);
    // Extract updated question IDs from client data
    const updatedQuestionIds = updatedQuizData.questions
      .filter((q) => q._id) // Only include questions with an ID
      .map((q) => q._id);

    // Find IDs of questions to delete
    const questionsToDelete = updatedQuizData.deletedQuestions;

    // console.log(existingQuiz.questions[0]?.constructor.name);

    // Remove questions marked for deletion
    questionsToDelete.forEach((id) => {
      // existingQuiz.questions.id(id).remove();
      const question = existingQuiz.questions.id(id); // Get the subdocument
      // console.log(id);
      if (question) {
        existingQuiz.questions.pull(id); // Remove the question
      }
    });

    // Add or update remaining questions
    updatedQuizData.questions.forEach((updatedQuestion) => {
      if (updatedQuestion._id) {
        // Update existing question
        const question = existingQuiz.questions.id(updatedQuestion._id);
        if (question) {
          question.set(updatedQuestion);
        }
      } else {
        // Add new question
        existingQuiz.questions.push(updatedQuestion);
      }
    });

    // Update the quiz's metadata
    existingQuiz.title = updatedQuizData.title;
    // existingQuiz.subject = updatedQuizData.subject;
    existingQuiz.endless = updatedQuizData.endless;
    existingQuiz.endDate = updatedQuizData.endDate || null;

    // Save the updated quiz
    const updatedQuiz = await existingQuiz.save();

    return {
      success: true,
      message: 'Quiz updated successfully',
      data: updatedQuiz.toObject({ flattenObjectIds: true }),
    };
  } catch (error) {
    console.error('Error updating quiz:', error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}

// Terminate a quiz
export const terminateQuiz = async (quizId) => {
  try {
    await connectDB(); // Connect to the database
    // Find the existing quiz by quizId
    const existingQuiz = await Quiz.findOne({ quizId });
    //update date to date.now and change endless to false
    existingQuiz.endless = false;
    existingQuiz.endDate = Date.now();
    // Save the updated quiz
    const updatedQuiz = await existingQuiz.save();
    return {
      success: true,
      message: 'Quiz terminated successfully',
      data: updatedQuiz.toObject({ flattenObjectIds: true }),
    };
  } catch (error) {
    console.error('Error updating quiz:', error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}

//Delete a quiz
export const deleteQuiz = async (quizId) => {
  try {
    await connectDB(); // Connect to the database
    // Find the existing quiz by quizId
    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Delete the quiz attempts
    await QuizAttempt.deleteMany({ quizId: quiz._id });

    // Delete the quiz
    await quiz.deleteOne();


    return {
      success: true,
      message: 'Quiz deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting quiz:', error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}

export const submitQuizAnswers = async (quizId, answers) => {

  await connectDB(); // Connect to the database
  // Fetch the quiz data and validate the answers here
  const quiz = await Quiz.findOne({ quizId });

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  // Compare answers with the correct ones and grade the quiz
  const correctAnswers = quiz.questions.reduce((acc, question) => {
    acc[question._id] = question.correctAnswer;
    return acc;
  }, {});

  let score = 0;
  for (const questionId in answers) {
    if (answers[questionId] === correctAnswers[questionId]) {
      score++;
    }
  }

  // You can save the score or return it
  return { score, total: quiz.questions.length };
};




export const getUserId = async (email) => {
  let u = await fetchUser(email);
  // console.log(u._id)
  if (u._id)
    return u._id;
  else
    return { error: "Error finding user in database" }
}



//Analytics
export const getQuizAnalytics = async (quizId) => {
  try {
    await connectDB(); // Connect to the database
    const quiz = await Quiz.findOne({ quizId })
      .populate({
        path: 'attempts',  // Populate the attempts field with QuizAttempt documents
        select: 'userEmail score maxMarks totalQuestions correctQuestions createdAt',  // Select only relevant fields
      })
      .exec();

    // console.log(quiz)

    // Example: Calculate the leaderboard (highest score first)
    const leaderboard = quiz.attempts.sort((a, b) => b.score - a.score).map((attempt) => ({
      userEmail: attempt.userEmail,
      score: attempt.score,
      maxMarks: attempt.maxMarks,
      correctQuestions: attempt.correctQuestions,
      totalQuestions: attempt.totalQuestions,
    }));

    // Example: Calculate total number of attempts
    const totalAttempts = quiz.attempts.length;

    // Example: Calculate average score
    const totalScore = quiz.attempts.reduce((acc, attempt) => acc + attempt.score, 0);
    // const averageScore = totalScore / totalAttempts;
    const averageScore = totalAttempts > 0 ? (totalScore / totalAttempts).toFixed(2) : 0;

    // Optional: Additional metrics
    const totalCorrectQuestions = quiz.attempts.reduce((acc, attempt) => acc + attempt.correctQuestions, 0);
    const averageAccuracy = totalAttempts > 0
      ? ((totalCorrectQuestions / (totalAttempts * quiz.questions.length)) * 100).toFixed(2)
      : 0;

    return {
      title: quiz.title,
      subject: quiz.subject,
      leaderboard,
      totalAttempts,
      averageScore,
      averageAccuracy,
      // You can also calculate more metrics like highest/lowest scores
    };
  } catch (error) {
    console.error('Error fetching quiz analytics:', error);
    throw error;
  }
};

export const isValidAttempt = async (quizId, userEmail) => {
  try {

    await connectDB();
    //Check if the user has already attempted the quiz
    const quizAttempt = await QuizAttempt.findOne({ quizId, userEmail });
    return quizAttempt ? false : true;
  } catch (error) {
    console.error('Error checking quiz attempt:', error);
    return false;
  }
};

export const saveQuizAttempt = async (quizAttemptData) => {
  const { quizId, userEmail } = quizAttemptData;

  try {
    // Connect to the database
    await connectDB();

    // Check if the user has already attempted the quiz
    const isValid = await isValidAttempt(quizId, userEmail);

    // if (existingAttempt) {
    //   return {
    //     success: false,
    //     message: "You have already attempted this quiz.",
    //     data: existingAttempt.toObject({ flattenObjectIds: true }),
    //   };
    // }
    if (!isValid) {
      return {
        success: false,
        message: "You have already attempted this quiz.",
      }
    }

    // Create and save the QuizAttempt document
    const savedAttempt = await QuizAttempt.create(quizAttemptData);

    // Add to quiz
    const quiz = await Quiz.findOne({ _id: quizId });
    // console.log(quiz);
    quiz.attempts.push(savedAttempt._id);
    await quiz.save();

    return {
      success: true,
      data: savedAttempt.toObject({ flattenObjectIds: true }),
      message: "Quiz attempt saved successfully.",
    };
  } catch (error) {
    console.error("Error saving quiz attempt:", error);
    return {
      success: false,
      message: "Failed to save quiz attempt.",
      error: error.message,
    };
  }
};

export const getQuizAttemptDetails = async (quizId, userEmail) => {
  try {
    await connectDB();
    console.log("[DEBUG] Incoming request: ", quizId, userEmail);

    const quizAttempt = await QuizAttempt.findOne({ quizId, userEmail }).exec();


    if (!quizAttempt) {
      throw new Error('Quiz attempt not found');
    }

    // Return the quiz attempt details
    return {
      score: quizAttempt.score,
      maxMarks: quizAttempt.maxMarks,
      totalQuestions: quizAttempt.totalQuestions,
      correctQuestions: quizAttempt.correctQuestions,
    };
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch quiz attempt details');
  }
};

export const getLeaderboard = async (quizId) => {
  try {
    await connectDB();

    // Fetch top 10 leaderboard entries based on scores
    const leaderboard = await QuizAttempt.find({ quizId })
      .sort({ score: -1 })
      .exec();

      // console.log("Leaderboard: ", quizId);

    return leaderboard.map((attempt) => ({
      userEmail: attempt.userEmail,
      score: attempt.score,
    }));
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch leaderboard');
  }
};

export const getQuizFeedback = async (quizId, userEmail) => {
  try {
    await connectDB();
    console.log("[DEBUG] Incoming request for feedback: ", quizId, userEmail);
    // Fetch quiz attempt
    const quizAttempt = await QuizAttempt.findOne({ quizId, userEmail }).exec();
    if (!quizAttempt) {
      throw new Error('Quiz attempt not found');
    }
    // Fetch the quiz questions
    const quiz = await Quiz.findById(quizId).lean().exec();
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Prepare feedback data
    const feedback = quiz.questions.map((question) => {
      const userAnswer = quizAttempt.answers.get(question._id.toString());
      const correctOption = question.options[question.correctOption];
      const isCorrect = userAnswer === correctOption;

      return {
        questionText: question.questionText,
        userAnswer,
        correctOption,
        isCorrect,
        explanation: question.explanation || 'No explanation provided.',
      };
    });
    
    return feedback;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch quiz feedback');
  }
};


//Organization
export const isUserReg = async (email) => {
  try {
    await connectDB();

    let u = await User.findOne({ email: email });
    if (u) {
      const userTypes = u.user_type.map((type) => type.type);
      if (userTypes.includes("Individual") && userTypes.includes("Organization")) {
      return { status: true, regType: "Both", message: "User is registered as both Individual and Organization" };
      } else if (userTypes.includes("Individual")) {
      return { status: true, regType: "Individual", message: "User is registered as Individual" };
      } else if (userTypes.includes("Organization")) {
      return { status: true, regType: "Organization", message: "User is registered as Organization" };
      }
    } else {
      return { status: false, message: "User not registered" };
    }

  } catch (err) {
    // console.log(err);
    return { status: false, error: "Error finding user in database" };
  }
}


export const isValidOrg = async (name, type) => {
  try {
    await connectDB();
    let org = await Organization.findOne({ name });

    if (type === "New") {
      if (org) return { status: false, message: "Organization with this name already exists" };
      else return { status: true, message: "Organization name is valid" };
    }
    else if (type === "Existing") {
      if (org) return { status: true, message: "Organization found" };
      else return { status: false, message: "Organization not found" };
    }
    else return { status: false, message: "Invalid type" };
  }
  catch (err) {
    console.log(err);
    return { error: "Error finding organization in database" };
  }
}

export const registerOrg = async (orgData, userData) => {
  try {
    await connectDB();
    let org = await Organization.findOne({ name: orgData.name });
    if (org) return { status: false, message: "Organization with this name already exists." }

    let isuReg = await isUserReg(userData.email);
    if(userData.isReg && !isuReg.status){
      return {status: false, message: isuReg.message || isuReg.error}
    }
    else if(!userData.isReg && isuReg.status){
      return {status: false, message: isuReg.message}
    }
    
    if (isuReg.regType === "Organization" || isuReg.regType === "Both")
      return {status: false, message: "User already registered to a organization"};
    
    let user;
    if (userData.isReg) {
      user = await User.findOne({ email: userData.email });
      if (!user) return { status: false, message: "User not found" };
    } else {
      user = await registerUser(userData);
      if (user.status == false) return { status: false, message: user.message };
    }
    if (user.error) return { status: false, message: "Error registering user" };

    org = await Organization.create({
      name: orgData.name,
      description: orgData.description,
      admins: [user._id],
    })
    if (userData.isReg) await User.updateOne({ _id: user._id }, { $push: { user_type: { type: "Organization", rights: "admin" } } });
    await User.updateOne({ _id: user._id }, { $set: { organization: org._id } });

    // console.log(org, user);
    return { status: true, message: "Organization created successfully" };
  }
  catch (err) {
    console.log(err);
    return { status: false, error: "Error creating organization" };
  }
}

export const isUserRTOrg = async (orgId, userId) => {
  try {
    await connectDB();
    let user = await User.findOne({ _id: userId });
    // console.log(user.organization.equals(orgId))
    if (user.user_type.some((type) => type.type === "Organization")) {
      if (user.organization.equals(orgId)) {
        return { status: true, message: "User is already part of this organization", inOrg: true };
      }
      return { status: true, message: "User is already part of another organization", inOrg: false };
    }
    return { status: false, message: "User is not part of any organization" };
  }
  catch (err) {
    console.log(err);
    return { status: false, error: "Error finding user in database" };
  }
}

export const addOrgUser = async (orgName, userData) => {
  try {
    await connectDB();

    let org = await Organization.findOne({ name: orgName });
    if (!org) return { status: false, message: "Organization not found" };

    let isuReg = await isUserReg(userData.email);
    if(userData.isReg && !isuReg.status){
      return {status: false, message: isuReg.message || isuReg.error}
    }
    else if(!userData.isReg && isuReg.status){
      return {status: false, message: isuReg.message}
    }

    let user;
    if (userData.isReg) {
      user = await User.findOne({ email: userData.email });
      if (!user) return { status: false, message: "User is not registered as Individual. Please uncheck the box." };
    }
    else {
      user = await registerUser(userData);
      if (user.status == false) return { status: false, message: user.message };
    }

    let isUsrReg = await isUserRTOrg(org._id, user._id);
    if (isUsrReg.status) {
      if (isUsrReg.inOrg) {
        if (user.user_type.some((type) => type.rights === "admin"))
          return { status: false, message: "User is already an admin of this organization" };
        else
          return { status: false, message: "User is already a student of this organization" };
      }
      return { status: false, message: isUsrReg.message };
    }

    if (userData.userType === "admin") {
      org.admins.push(user._id);
    }
    else if (userData.userType === "student")
      org.students.push(user._id);
    await org.save();

    try {
      if (userData.isReg) await User.updateOne({ _id: user._id }, { $push: { user_type: { type: "Organization", rights: userData.userType } } });
      await User.updateOne({ _id: user._id }, { $set: { organization: org._id } });
    } catch (err) {
      console.log(err);
      return { status: false, error: "Error adding organization to user" };
    }

    return { status: true, message: "User added to organization successfully" };
  }
  catch (err) {
    console.log(err);
    return { status: false, error: "Error adding user to organization" };
  }
}

export const fetchOrg = async(orgId)=>{
  try{
    connectDB();

    let org = await Organization.findOne({_id:orgId});
    if(!org)
      return {status:false, message: "Organization does not exist"}

    org = org.toObject(({ flattenObjectIds: true}));
    return {status:true, data:org, message: "Organization found"}
  }
  catch(err){
    console.log(err);
    return {status:false, error: "Error finding Organization"};
  }
}
