import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'
import { User } from 'firebase';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private _afa: AngularFireAuth, private _router: Router) {}

  get user$(): Observable<User>{
    return this._afa.user;
  }

  get isLoggedInStream$(): Observable<boolean>{
    return this.user$.pipe(map((userEvent: User) => userEvent !== null))
  }

  loginWithPopup(){
    this._afa.auth.signInWithPopup(new auth.FacebookAuthProvider())
    .catch(error => console.log('Login failed :', error.message))

  }

  logout(){
    this._afa.auth.signOut()
    .then(() => {
      this._router.navigate(['/login'])
    })    
  }
  

}
