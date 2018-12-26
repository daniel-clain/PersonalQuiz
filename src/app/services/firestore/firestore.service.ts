import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, DocumentData, DocumentReference, AngularFirestore, DocumentSnapshot, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { User } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private _authService: AuthService, private _afs: AngularFirestore) {

    const userDoc: AngularFirestoreDocument = this._afs.collection('Users').doc('Jarrad')

    //userDoc.collection('Questions').doc('What color is a bannana?').set({correctAnswer: 'yellow'})
    userDoc.collection('Quizzes').add({questionsAndAnswers: 'yellow'})

  }

  create(collectionName: string, dataObj: any): Promise<DocumentReference>{
    return this.collectionPromise(collectionName).then(collection => collection.add(dataObj))
  }

  update(collectionName: string, dataObj: any): Promise<void>{
    return this.collectionPromise(collectionName).then(collection => collection.doc(dataObj.id).update(dataObj))
  }

  delete(collectionName: string, docId: string): Promise<void>{
    return this.collectionPromise(collectionName).then(collection => collection.doc(docId).delete())
  }

  dataObservable(collectionName: string){
    return new Observable((subscriber: Subscriber<any[]>) => {
      this.collectionPromise(collectionName)
      .then(collection => {
        const subscription = 
        collection
        .snapshotChanges()
        .pipe(map(
          (questionsData: DocumentData[]) => {
            return questionsData.map((documentData: DocumentData) => {        
              const data = documentData.payload.doc.data()
              data.id = documentData.payload.doc.id
              return data;
            })
          }
        ))
        .subscribe((data: any[]) => {
          subscriber.next(data)
          subscription.unsubscribe();
        })
      })
    })
  }

  collectionPromise(collectionName: string): Promise<AngularFirestoreCollection>{
    return new Promise((resolve, reject) => {
      const subscription = this._authService.user.subscribe(
        (userEvent: User) => {
          if(userEvent !== null){
            const collection: AngularFirestoreCollection = 
            this._afs.collection(collectionName,  ref => ref.where('userId', '==', userEvent.uid))
            resolve(collection)
          }
          subscription.unsubscribe()
          console.log(`could not get ${collectionName} because user is not authenticated`);
        }
      )
    })
  }  

  getDataById(collectionName: string, id: string): Promise<any>{
    return this.collectionPromise(collectionName).then((collection): Promise<any> => {
      return new Promise((resolve, reject) => {
        const subscription: Subscription = collection.doc(id).get().subscribe({
          next: (doc: DocumentSnapshot<any>) => {
            subscription.unsubscribe()
            const data = doc.data();
            data.id = doc.id;
            resolve(data)
          },
          error: err => {
            console.log('err :', err);
            console.log('id :', id);
            reject(err)
          }
        })
      })
    })
  }

}
