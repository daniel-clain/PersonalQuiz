import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {

  constructor(private _authService: AuthService, private _router: Router) {
    this._authService.isUserAuthorised$.subscribe((isUserAuthorised: boolean) => {
      if(isUserAuthorised)
        this._router.navigate([''])
    })
  }

  signInWithFacebook(){
    this._authService.loginWithPopup()
  }

}
