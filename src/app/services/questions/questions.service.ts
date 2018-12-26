import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Question } from 'src/app/models/question';
import { FirestoreService } from '../firestore/firestore.service';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  constructor(private _firestoreService: FirestoreService) {}  

  get questions$(): Observable<Question[]> {
    return this._firestoreService.dataObservable('questions')
  }
  
  addNewQuestion(question: Question): Promise<any>{
    return this._firestoreService.create('questions', question)
  }

  updateQuestion(question: Question): Promise<void>{
    return this._firestoreService.update('questions', question)
  }

  deleteQuestion(questionId: string): Promise<void>{
    return this._firestoreService.delete('questions', questionId)
  }  

  getQuestionById(id): Promise<Question>{
    return this._firestoreService.getDataById('questions', id)
  }
}
