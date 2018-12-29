import { Injectable } from '@angular/core';
import { QueryDocumentSnapshot } from 'angularfire2/firestore';
import { Answer, AnswerFlat } from 'src/app/models/answer';
import { DataService } from '../data/data.service';
import { CollectionNames } from 'src/app/models/collection-enum';
import { Observable, Subject, Subscriber, Subscription } from 'rxjs';
import { map, debounceTime, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {

  
  answers: Answer[]
  answerUpdates$: Subject<Answer[]> = new Subject();
  answersDataSubscription: Subscription

  answers$: Observable<Answer[]> = Observable.create((subscriber: Subscriber<Answer[]>) => {
    if(!this.answersDataSubscription){
      this.setupAnswersDataSubscription()
    }
    if(this.answers)
      subscriber.next(this.answers)
    this.answerUpdates$.subscribe((updatedAnswers: Answer[]) => {
      subscriber.next(updatedAnswers)
    })
  })

  constructor(private _dataService: DataService) {}

  
  private setupAnswersDataSubscription(){
    this.answersDataSubscription = this.getAnswersData$().subscribe((answers: Answer[]) => {
      this.answers = answers;
      console.log('answers updated :', this.answers);
      this.answerUpdates$.next(this.answers)
    })
  }
 

  private getAnswersData$(): Observable<Answer[]>{
    return this._dataService.getCollectionData(CollectionNames.Answers)
    .pipe(map((answersSnapshot: QueryDocumentSnapshot<any>[]) => (
      answersSnapshot.map((answerSnapshot: QueryDocumentSnapshot<any>) => (
        <Answer>{ id: answerSnapshot.id, ...answerSnapshot.data() }
      ))
    )))
  }

  
  getAnswerById(id): Promise<Answer>{     
    return new Promise(resolve => 
      this.answers$
      .pipe(
        map((answer: Answer[]) => answer.find((answers: Answer) => answers.id == id)),
        debounceTime(1),
        take(1)
      )
      .subscribe((answer: Answer) => resolve(answer))
    )  
  }
  getTagById(id): Promise<Answer>{
    return this.answers$.pipe(map((answers: Answer[]) => answers.find((answer: Answer) => answer.id == id))).toPromise()   
  }

  add(answer: Answer): Promise<string>{
    const flatAnswer: AnswerFlat = this.convertToFlatAnswer(answer)
    return this._dataService.addToCollection(CollectionNames.Answers, flatAnswer) 
  }

  delete(answer: Answer): Promise<void>{
    return this._dataService.deleteFromCollection(CollectionNames.Answers, answer.id)
  }

  convertToFlatAnswer(answer: Answer): AnswerFlat{
    const flatAnswer: AnswerFlat = {
      value: answer.value,
      correct: answer.correct,
    }
    return flatAnswer
  }
  
}
