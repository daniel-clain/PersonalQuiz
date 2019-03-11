import {Test2Service} from './test2.service';
import {Observable} from 'rxjs';
import { Injectable } from '@angular/core';
import { CollectionNames } from 'src/app/enums/collection-names-enum';
import { AngularFirestoreCollection } from 'angularfire2/firestore';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor(
    private _test2Service: Test2Service
  ) { }

  doTest(): string {
    const thingVal = this._test2Service.doThing();
    console.log('thingVal :', thingVal);
    return thingVal + ' plusTest';
  }
}
