import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth'
import { auth } from 'firebase';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {

  constructor(private _afa: AngularFireAuth) {}

  signInWithFacebook(){
    this._afa.auth.signInWithPopup(new auth.FacebookAuthProvider())
  }

}
