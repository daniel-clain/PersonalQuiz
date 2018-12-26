import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentSnapshot } from 'angularfire2/firestore';
import { AuthService } from '../auth/auth.service';
import { Answer } from 'src/app/models/answer';
import { Observable, Subscriber } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { User } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AnswersService {

  
  constructor(private _afs: AngularFirestore, private _authService: AuthService) {
    
  }

  get userAnswerCollection$(): Observable<AngularFirestoreCollection>{
    return this._authService.user.pipe(switchMap(
      (userEvent: User) => {
        if(userEvent !== null){
          return new Observable((subscriber: Subscriber<AngularFirestoreCollection>) => {
            const collection: AngularFirestoreCollection = 
            this._afs.collection('answers',  ref => ref.where('userId', '==', userEvent.uid))
            subscriber.next(collection)
          })
        }
        console.log('could not get answers because user is not authenticated');
      }
    ))
  }
  
  getAnswerById(id): Promise<Answer>{
    return new Promise((resolve, reject) => {
      this.userAnswerCollection$.subscribe(
        (collection: AngularFirestoreCollection) => {
          collection.doc(id).get().subscribe(
            (answerDoc: DocumentSnapshot<any>) => {
              const ans = answerDoc.data();
              ans.id = answerDoc.id;
              const answer: Answer = ans;
              resolve(answer)
            }
          )
        }
      )
    })
  }

  saveAnswer(answerToSave: Answer): Promise<string>{
    return new Promise((resolve, reject) => {
      this.userAnswerCollection$.subscribe(
        (answerCollection: AngularFirestoreCollection) => {
          console.log('answerToSave :', answerToSave);
          answerCollection.add(answerToSave).then(doc => {
            console.log('answer save then ', doc);
            resolve(doc.id)
          })
        }
      )
    })
  }
  
}
