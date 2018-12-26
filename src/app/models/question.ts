import { Answer } from "./answer";

export interface Question{
    id: string;
    userId: string;
    category: string;
    value: string;
    correctAnswer: string;
    dateUpdated: Date;
}
