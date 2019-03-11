import { Tag } from './tag';

export interface Question {
    id: string;
    value: string;
    tags: Tag[];
    correctAnswer: string;
    dateUpdated: Date;
}
export interface QuestionFlat {
    value: string;
    tagIds: string[];
    correctAnswer: string;
    dateUpdated: any;
}



