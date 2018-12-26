import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AngularFireAuth } from 'angularfire2/auth'
import { auth } from 'firebase';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {

  constructor(private _authService: AuthService, private _afa: AngularFireAuth) {}

  ngOnInit() {
  }

  signInWithGoogle(){
    this._afa.auth.signInWithPopup(new auth.GoogleAuthProvider()).then(x => {
      console.log('x :', x);
    })
  }

  loginHandler(email: string, password: string){
    this._authService.loginUser(email, password);
  }

  signupHandler(email: string, password: string){
    this._authService.signupUser(email, password);
  }

  facebookLoginHandler(){

  }

}
