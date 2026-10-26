import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UserInfo } from '../../domain/userInfo';
import { UserService } from '../../services/user.service';
import { ContributionsDashboardComponent } from './contributions-dashboard.component';

/**
 * UserService starts its user info at null and emits null again when it is cleared. rxjs 6 silently dropped a subscriber
 * whose handler threw, rxjs 7 keeps it and reports the error, so the handler has to cope with null itself.
 */
describe('ContributionsDashboardComponent', () => {
  let userInfo$: BehaviorSubject<UserInfo>;
  let userService: {userId: string, getUserObservable: () => BehaviorSubject<UserInfo>};

  const userInfo = (email: string) => {
    const info = new UserInfo();
    info.user.email = email;
    info.stakeholders = [];
    info.coordinators = [];
    info.administrators = [];
    return info;
  };

  // Not rendered: the constructor is where the user info is subscribed.
  const create = () => {
    const component = TestBed.createComponent(ContributionsDashboardComponent).componentInstance;
    spyOn(component, 'setGroup');
    return component;
  };

  beforeEach(() => {
    userInfo$ = new BehaviorSubject<UserInfo>(null);
    userService = {userId: null, getUserObservable: () => userInfo$};
    TestBed.configureTestingModule({
      providers: [provideRouter([]), {provide: UserService, useValue: userService}]
    });
  });

  it('ignores the initial null and handles the user info that follows', fakeAsync(() => {
    const component = create();
    // rxjs reports an error thrown by a subscriber on a timer, so the failure only shows up on tick
    tick();

    expect(component.userInfo).toBeNull();
    expect(userService.userId).toBeNull();
    expect(component.setGroup).not.toHaveBeenCalled();

    userInfo$.next(userInfo('admin@example.org'));
    tick();

    expect(component.userInfo.user.email).toBe('admin@example.org');
    expect(userService.userId).toBe('admin@example.org');
    expect(component.setGroup).toHaveBeenCalledTimes(1);
  }));

  it('copes with the user info being cleared', fakeAsync(() => {
    const component = create();
    userInfo$.next(userInfo('admin@example.org'));
    tick();

    userInfo$.next(null);
    tick();

    expect(component.userInfo).toBeNull();
    expect(component.setGroup).toHaveBeenCalledTimes(1);
  }));
});
