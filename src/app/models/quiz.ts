import { Question } from './question'
import { Answer } from './answer';
export interface Quiz{
    id: string;
    questionsAndAnswers: QuestionAndAnswer[];
    dateCompleted: Date;
}

export interface QuizFlat{
    questionsAndAnswersIds: QuestionAndAnswerIds[];
    dateCompleted: any;
}

export interface QuestionAndAnswer{
    question: Question,
    answer: Answer
}

export interface QuestionAndAnswerIds{
    questionId: string,
    answerId: string
}