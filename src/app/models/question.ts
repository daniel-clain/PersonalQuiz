import { Category } from "./category";
import { DocumentReference, AssociatedReference } from "angularfire2/firestore";

export interface Question{
    id: string;
    value: string;
    category: Category;
    correctAnswer: string;
    dateUpdated: Date;
}
export interface QuestionFlat{
    value: string;
    categoryId: string;
    correctAnswer: string;
    dateUpdated: any;
}



