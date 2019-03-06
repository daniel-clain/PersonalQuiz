import { Question } from './question';
import { Answer } from './answer';
import { Tag } from './tag';
export interface Quiz {
    id: string;
    tags: Tag[];
    questionsAndAnswers: QuestionAndAnswer[];
    dateCompleted: Date;
}

export interface QuizFlat {
    tagIds: string[];
    questionsAndAnswersIds: QuestionAndAnswerIds[];
    dateCompleted: any;
}

export interface QuestionAndAnswer {
    question: Question;
    answer: Answer;
}

export interface QuestionAndAnswerIds {
    questionId: string;
    answerId: string;
}
