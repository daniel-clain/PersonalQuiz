import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth'
import { auth } from 'firebase';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {

  constructor(private _authService: AuthService, private _router: Router) {
    this._authService.isLoggedInStream$.subscribe((isLoggedIn: boolean) => {
      if(isLoggedIn)
        this._router.navigate([''])
    })
  }

  signInWithFacebook(){
    this._authService.loginWithPopup()
  }

}
