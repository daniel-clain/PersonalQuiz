import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { AngularFirestore, DocumentData, AngularFirestoreCollection, DocumentReference, DocumentChangeAction, DocumentSnapshot } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { switchMap, map } from 'rxjs/operators';
import { User } from 'firebase';
import { CollectionNames } from 'src/app/models/collection-enum';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private _authService: AuthService, private _afs: AngularFirestore, private _afa: AngularFireAuth, private _dataService: DataService) { }

  getCollectionData(collectionName: CollectionNames): Observable<any[]> {
    return this.getCollection(collectionName).pipe(switchMap(
      (collection: AngularFirestoreCollection) => (
        collection.snapshotChanges()
          .pipe(map(this.transformSnapshot))
      )
    ))
  }

  transformSnapshot(events: { payload: any, type: string }[]) {
    console.log('get data');
    return events.map(event => event.payload.doc)
  }

  getCollection(collectionName: CollectionNames): Observable<AngularFirestoreCollection> {
    return this._afa.user.pipe(switchMap(
      (user: User) => {
        const collectionNameString: string = CollectionNames[collectionName]
        return of(this._afs.collection('Users').doc(user.uid)
          .collection(collectionNameString))
      }
    ))
  }


  addToCollection(collectionName: CollectionNames, obj: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const subscription = this.getCollection(collectionName).subscribe(
        (collection: AngularFirestoreCollection) => {
          subscription.unsubscribe()
          resolve(collection.add(obj).then(docRef => docRef.id))
        })
    })
  }

  updateInCollection(collectionName: CollectionNames, id: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const subscription = this.getCollection(collectionName).subscribe(
        (collection: AngularFirestoreCollection) => {
          subscription.unsubscribe()
          resolve(collection.doc(id).update(data))
        })
    })
  }

  deleteFromCollection(collectionName: CollectionNames, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const subscription = this.getCollection(collectionName).subscribe(
        (collection: AngularFirestoreCollection) => {
          subscription.unsubscribe()
          resolve(collection.doc(id).delete())
        })
    })
  }

  getCollectionDataById(collectionName: CollectionNames, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const subscription = this.getCollection(collectionName).subscribe(
        (collection: AngularFirestoreCollection) => {
          subscription.unsubscribe()
          const subscription2 = collection.doc(id).snapshotChanges().subscribe((idData) => {
            subscription2.unsubscribe()
            const data: any = idData.payload.data()
            if (data == undefined) {
              resolve(undefined)
            } else {
              data.id = idData.payload.id
              resolve(data)
            }
          })
        })
    })
  }

}
