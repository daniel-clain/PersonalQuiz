import { Question } from './question'
import { Answer } from './answer';
export interface Quiz{
    id: string;
    userId: string;
    questionsAndAnswers: QuestionAndAnswer[];
    dateCompleted: Date;
}

export interface QuizShallow{
    id: string;
    userId: string;
    questionsAndAnswers: QuestionAndAnswerIds[];
    dateCompleted: Date;
}

export interface QuestionAndAnswer{
    question: Question,
    answer: Answer
}

export interface QuestionAndAnswerIds{
    questionId: string,
    answerId: string
}