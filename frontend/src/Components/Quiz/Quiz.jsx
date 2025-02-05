import React, { useState, useEffect } from "react";
import questions from "./Questions";
import "./Quiz.css";
import AstraLogo from "../../assets/Astrap_nobg.png";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const Quiz = () => {
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const navigate = useNavigate();

  // Utility function to shuffle an array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Shuffle and select 10 random questions when component loads
  useEffect(() => {
    const shuffleQuestions = (questionsArray) => {
      const shuffled = shuffleArray(questionsArray).slice(0, 10); // Select 10 random questions
      return shuffled.map((question) => {
        // Shuffle options for each question
        const shuffledOptions = shuffleArray(question.options);
        // Find the new index of the correct answer
        const correctIndex = shuffledOptions.findIndex(
          (option) => option === question.options[question.correct]
        );
        return {
          ...question,
          options: shuffledOptions,
          correct: correctIndex, // Update correct index
        };
      });
    };
    setShuffledQuestions(shuffleQuestions(questions));
  }, []);

  const handleAnswer = (selectedIndex) => {
    setSelectedOptionIndex(selectedIndex);
    const correctIndex = shuffledQuestions[currentQuestionIndex].correct;
    const isAnswerCorrect = selectedIndex === correctIndex;
    setIsCorrect(isAnswerCorrect);
    if (isAnswerCorrect) setScore(score + 1);
    setFeedback(shuffledQuestions[currentQuestionIndex].feedback);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowFeedback(false);
      setSelectedOptionIndex(null);
      setIsCorrect(null);
    } else {
      setIsQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowFeedback(false);
    setFeedback("");
    setSelectedOptionIndex(null);
    setIsCorrect(null);
    setIsQuizComplete(false);
    // Reshuffle questions for the new quiz session
    const shuffleQuestions = (questionsArray) => {
      const shuffled = shuffleArray(questionsArray).slice(0, 10);
      return shuffled.map((question) => {
        const shuffledOptions = shuffleArray(question.options);
        const correctIndex = shuffledOptions.findIndex(
          (option) => option === question.options[question.correct]
        );
        return {
          ...question,
          options: shuffledOptions,
          correct: correctIndex,
        };
      });
    };
    setShuffledQuestions(shuffleQuestions(questions));
  };

  return (
    <div className="quiz-wrapper">
      <div className="quiz-container">

        {/* Astra Logo */}
        <img src={AstraLogo} alt="Astra Logo" className="astra-logo" />

        {/* Back Button */}
        <button className="back-button" onClick={() => navigate("/")}>
          <FaArrowLeft className="back-icon" /> Back to Astra
        </button>

        <h1 className="quiz-title">Test Your Cybersecurity Knowledge</h1>

        {/* Conditionally render the current score */}
        {!isQuizComplete && <div className="current-score">Score: {score}</div>}

        {!isQuizComplete ? (
          <div className="quiz-box">
            <h2 className="quiz-question">
              {shuffledQuestions[currentQuestionIndex]?.question}
            </h2>
            <div className="quiz-options">
              {shuffledQuestions[currentQuestionIndex]?.options.map(
                (option, index) => (
                  <button
                    key={index}
                    className={`quiz-option ${selectedOptionIndex !== null
                        ? index === shuffledQuestions[currentQuestionIndex].correct
                          ? "correct"
                          : index === selectedOptionIndex
                            ? "incorrect"
                            : ""
                        : ""
                      }`}
                    onClick={() => handleAnswer(index)}
                    disabled={showFeedback}
                  >
                    {option}
                  </button>
                )
              )}
            </div>
            {showFeedback && (
              <div className="quiz-feedback">
                <p>{feedback}</p>
                <button className="next-button" onClick={handleNext}>
                  Next Question
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="quiz-box quiz-complete-box">
            <h2>Quiz Complete!</h2>
            <p>Your Score: {score} / 10</p>
            <button className="reset-button" onClick={resetQuiz}>
              Restart Quiz
            </button>
          </div>
        )}
      </div>
    </div>

  );

};

export default Quiz;
