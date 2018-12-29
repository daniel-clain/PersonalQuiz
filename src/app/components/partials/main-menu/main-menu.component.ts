import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html'
})
export class MainMenuComponent {

  isLoggedIn$: Observable<boolean>

  constructor(private _authService: AuthService) {
    this.isLoggedIn$ = _authService.isUserAuthorised$
  }
  logoutHandler(){
    this._authService.logout()
  }
}
