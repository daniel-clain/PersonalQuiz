import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'
import { User } from 'firebase';
import { Router } from '@angular/router';
import { Question } from 'src/app/models/question';
import { resolve } from 'bluebird';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _userStream$: Observable<User>;
  public isLoggedInStream$: Observable<boolean>;

  constructor(private _angularFireAuth: AngularFireAuth, private _router: Router) { 
  
    this._userStream$ = this._angularFireAuth.user;


    this.isLoggedInStream$ = this._angularFireAuth.authState.pipe(map((userEvent: User) => {
      const isUserLoggedIn: boolean = (userEvent === null) ? false : true;
      return isUserLoggedIn;
    }))

  }

  getUser(): Promise<User>{
    return new Promise((resolve, reject) => {
      const subscription = this._angularFireAuth.user.subscribe(
        (user: User) => {
          subscription.unsubscribe()
          if(user)
            resolve(user)
          else
            reject('user not authenticated')
        }
      )
    })
  }

  loginWithPopup(){
    this._angularFireAuth.auth.signInWithPopup(new auth.FacebookAuthProvider())
  }

  loginUser(email: string, password: string){
    this._angularFireAuth.auth.signInWithEmailAndPassword(email, password)
    .then(() => this._router.navigate(['']))
    .catch(error => console.log('Login failed :', error.message))
  }

  signupUser(email: string, password: string){
    this._angularFireAuth.auth.createUserWithEmailAndPassword(email, password)  
    .catch(error => console.log('Signup failed :', error.message)) 
  }

  logout(){
    this._angularFireAuth.auth.signOut()
    .then(() => {
      this._router.navigate([''])
    })
    
  }
  

  get user(): Observable<User>{
    return this._userStream$;
  }
}
