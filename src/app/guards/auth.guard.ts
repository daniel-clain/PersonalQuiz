import { Injectable } from '@angular/core';
import { CanActivate, Router, GuardsCheckEnd } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { Observable } from 'rxjs';
import { map, filter  } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {

  lastNavigationAttemptedUrl: string;

  constructor(private _authService: AuthService, private _router: Router){
    this.trackLastNavigationAttempt();
    this.whenUserLogsInResumeNavigation();
  }

  trackLastNavigationAttempt(){
    this._router.events
    .pipe(
      filter((routerEvent: GuardsCheckEnd) => routerEvent.constructor.name === "NavigationCancel" && routerEvent.url !== "/login"),
      map((routerEvent: GuardsCheckEnd) => routerEvent.url)
    )
    .subscribe((routeUrl: string) => this.lastNavigationAttemptedUrl = routeUrl)
  }

  whenUserLogsInResumeNavigation(){
    this._authService.isUserAuthorised$.subscribe((isUserLoggedIn: Boolean) => {
      if(isUserLoggedIn && this.lastNavigationAttemptedUrl){
        this._router.navigate([this.lastNavigationAttemptedUrl])
      }
    })
  }

  canActivate(): Observable<boolean> {
    return this._authService.isUserAuthorised$.pipe(map((isUserAuthorised: boolean) => {
        if(isUserAuthorised === false){
          console.log(`Redirected to login page because user is not authenticated`);
          this._router.navigate(['login'])
        }
      return isUserAuthorised;
    }))
  }
}
