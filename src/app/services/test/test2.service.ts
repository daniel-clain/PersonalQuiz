import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Test2Service {

  private _name;

  constructor() {
    this.name = 'cat';
   }
  doThing(): string {
    return this.name;
  }
  set name(name) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

}
