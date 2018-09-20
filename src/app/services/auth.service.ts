import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _isUserLoggedIn: boolean;

  constructor() { 
    if(!environment.production){
      this.isUserLoggedIn = true;
    }
  }

  loginUser(){
    this.isUserLoggedIn = true;
  }

  set isUserLoggedIn(val: boolean){
    this._isUserLoggedIn = val;
  }
  

  get isUserLoggedIn(): boolean{
    return this._isUserLoggedIn;
  }
}
