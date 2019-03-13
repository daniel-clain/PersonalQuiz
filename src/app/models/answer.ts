export interface Answer {
    id: string;
    value: string;
    correct: boolean;
}

export interface AnswerFlat {
    value: string;
    correct: boolean;
}