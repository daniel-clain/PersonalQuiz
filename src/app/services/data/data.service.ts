import { User } from 'firebase';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { AngularFirestore, AngularFirestoreCollection, DocumentSnapshot, Action, DocumentData } from 'angularfire2/firestore';
import { switchMap, map, take } from 'rxjs/operators';
import { CollectionNames } from '../../enums/collection-names-enum';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private _afs: AngularFirestore, private _authService: AuthService) { }

  getCollectionData(collectionName: CollectionNames): Observable<any[]> {
    return this.getCollection(collectionName).pipe(switchMap(
      (collection: AngularFirestoreCollection) => (
        collection.snapshotChanges()
          .pipe(map(this.transformSnapshot))
      )
    ));
  }

  transformSnapshot(events: any[]): DocumentData[] {
    console.log('get data');
    return events.map(event => {
      const {doc} = event.payload;
      const data = doc.data();
      if (!data) {
        throw Error(`doc ${doc.id} has no data`);
      }
      return doc;
    });
  }

  getCollection(collectionName: CollectionNames): Observable<AngularFirestoreCollection> {
    return this._authService.user$.pipe(switchMap((user: User) => {
      if (user) {
        const collectionNameString: string = CollectionNames[collectionName];
        return of(this._afs.collection('Users').doc(user.uid)
          .collection(collectionNameString));
      }
    }));
  }

  addToCollection(collectionName: CollectionNames, obj: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.getCollection(collectionName)
      .pipe(take(1))
      .subscribe((collection: AngularFirestoreCollection) => collection.add(obj).then(docRef => resolve(docRef.id)));
    });
  }

  updateInCollection(collectionName: CollectionNames, id: string, data: any): Promise<void> {
    return new Promise(resolve =>
      this.getCollection(collectionName)
      .pipe(take(1))
      .subscribe((collection: AngularFirestoreCollection) =>
        resolve(collection.doc(id).update(data))
      )
    );
  }

  deleteFromCollection(collectionName: CollectionNames, id: string): Promise<void> {
    return new Promise(resolve =>
      this.getCollection(collectionName)
      .pipe(take(1))
      .subscribe((collection: AngularFirestoreCollection) =>
        resolve(collection.doc(id).delete()))
    );
  }

  getCollectionDataById(collectionName: CollectionNames, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCollection(collectionName)
      .pipe(switchMap((collection: AngularFirestoreCollection) =>
        collection.doc(id).snapshotChanges()
        .pipe(map((snapshot: Action<DocumentSnapshot<any>>) => this.transformSnapshotSingle(snapshot)))
      ))
      .pipe(take(1))
      .subscribe((data) => resolve(data));
    });
  }
  transformSnapshotSingle(event): DocumentData[] {
      const doc = event.payload;
      const data = doc.data();
      if (!data) {
        throw Error(`doc ${doc.id} has no data`);
      }
      return doc;
  }

}
