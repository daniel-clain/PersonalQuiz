import { TestBed, async, inject } from '@angular/core/testing';

import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

import { AuthGuard } from './auth.guard';


describe('AuthGuard', () => {
  describe('canActivate', () => {

    let authService: AuthService;
    let authGuard: AuthGuard;
    let router: Router;

    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isUserLoggedIn']);
    
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  
    beforeEach(async() => {
      TestBed.configureTestingModule({
        providers: [ AuthGuard,
          {provide: AuthService, useValue: authServiceSpy },
          {provide: Router, useValue: routerSpy} ]
     });
    });

    beforeEach(() => {
      authGuard = TestBed.get(AuthGuard);
      authService = TestBed.get(AuthService);
      router = TestBed.get(Router);
    });

    it('should not navigate to login page if user is logged in', () => {
      authService.isUserLoggedIn = true;
      expect(authGuard.canActivate()).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to login page if user is logged out', () => {
      authService.isUserLoggedIn = false;    
      expect(authGuard.canActivate()).toEqual(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

  })
});
