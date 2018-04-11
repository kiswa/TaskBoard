import { TestBed, getTestBed } from '@angular/core/testing'

import { AuthGuard } from '../../../../src/app/shared/auth/auth.guard';
import { AuthService } from '../../../../src/app/shared/services';
import { AuthServiceMock } from '../../mocks';

describe('AuthGuard', () => {
  let injector: TestBed;
  let service: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        AuthGuard,
        { provide: AuthService, useClass: AuthServiceMock }
      ]
    });

    injector = getTestBed();
    service = injector.get(AuthGuard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('implements CanActivate', () => {
    let actual = false;

    service.canActivate().subscribe(value => actual = value);

    expect(actual).toEqual(true);
  });

});


