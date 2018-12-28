import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { AuthService } from '../auth/auth.service';
import { Answer, AnswerFlat } from 'src/app/models/answer';
import { DataService } from '../data/data.service';
import { CollectionNames } from 'src/app/models/collection-enum';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {

  
  constructor(private _afs: AngularFirestore, private _authService: AuthService, private _dataService: DataService) {
    
  }

  
  
  getAnswerById(id): Promise<Answer>{
    return this._dataService.getCollectionDataById(CollectionNames.Answers, id)
  }

  add(answer: Answer): Promise<string>{
    const flatAnswer: AnswerFlat = this.convertToFlatAnswer(answer)
    return this._dataService.addToCollection(CollectionNames.Answers, flatAnswer) 
  }

  convertToFlatAnswer(answer: Answer): AnswerFlat{
    const flatAnswer: AnswerFlat = {
      value: answer.value,
      correct: answer.correct,
    }
    return flatAnswer
  }
  
}
