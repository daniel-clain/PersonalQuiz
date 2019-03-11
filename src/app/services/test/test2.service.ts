import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Test2Service {

  constructor() { }
  doThing(): string {
    return 'cat';
  }
}
