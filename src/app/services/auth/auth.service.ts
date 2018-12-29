import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase/auth';
import { Observable, Subject, Subscriber, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators'
import { Router } from '@angular/router';
import { auth } from 'firebase/app';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: User
  userUpdates$: Subject<User[]> = new Subject();
  userDataSubscription: Subscription

  user$: Observable<User[]> = Observable.create((subscriber: Subscriber<User>) => {
    if(!this.userDataSubscription){
      this.setupUserDataSubscription()
    }
    if(this.user)
      subscriber.next(this.user)
    this.userUpdates$.subscribe((updatedUser: User) => {
      subscriber.next(updatedUser)
    })
  })

  constructor(private _afa: AngularFireAuth, private _router: Router) {}

  
  private setupUserDataSubscription(){
    this.userDataSubscription = this.getUserData$().subscribe((user: User) => {
      this.user = user;
      console.log('user updated :', this.user);
      this.userUpdates$.next(this.user)
    })
  }

  get isUserAuthorised$(): Observable<boolean>{
    return this.user$.pipe(map((user: User) => user !== null))
  }


  getUserData$(): Observable<User>{
    return this._afa.user;
  }

  loginWithPopup(){
    this._afa.auth.signInWithPopup(new auth.FacebookAuthProvider())
    .catch(error => console.log('Login failed :', error.message))
  }

  logout(){
    this._afa.auth.signOut()
    .then(() => this._router.navigate(['/login']))    
  }

}
