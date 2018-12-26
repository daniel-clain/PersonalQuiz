import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
      authService = TestBed.get(AuthService);
  })

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  it('should submit user logins', () => {
    authService.loginUser();
    expect(authService.isUserLoggedIn).toBe(true);
  })

  it('should get and set the users logged in state', () => {
    let spy = spyOnProperty(authService, "isUserLoggedIn").and.callThrough();
    authService.isUserLoggedIn = true;
    expect(authService.isUserLoggedIn).toEqual(true);
    expect(spy).toHaveBeenCalled();
  });

});
