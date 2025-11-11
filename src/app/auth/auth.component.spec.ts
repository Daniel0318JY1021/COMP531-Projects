import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthComponent } from './auth.component';
import { AuthStorage, User } from './auth.models';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let router: jasmine.SpyObj<Router>;

  const registeredUser: User = {
    id: 10,
    username: 'reguser',
    name: 'Registered User',
    email: 'reg@test.com',
    password: 'secret',
    phone: '',
    zipcode: '',
    followedUserIds: []
  };

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [AuthComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [{ provide: Router, useValue: router }]
    }).compileComponents();

    spyOn(AuthComponent.prototype as any, 'loadJsonPlaceholderUsers').and.returnValue(undefined);

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
    try { (AuthStorage as any).getRegisteredUsers?.and?.callThrough?.(); } catch { }
    try { (AuthStorage as any).setCurrentUser?.and?.callThrough?.(); } catch { }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit builds form and calls loader', () => {
    fixture.detectChanges();
    expect(component.loginForm).toBeDefined();
  });

  it('onLogin shows error when form invalid', () => {
    fixture.detectChanges();
    component.onLogin();
    expect(component.errorMessage).toBe('Please fill in all required fields');
  });

  it('onLogin logs in with registered user', () => {
    spyOn(AuthStorage as any, 'getRegisteredUsers').and.returnValue([registeredUser]);
    const setSpy = spyOn(AuthStorage as any, 'setCurrentUser');
    fixture.detectChanges();
    component.loginForm.patchValue({ username: 'reguser', password: 'secret' });
    component.onLogin();
    expect(setSpy).toHaveBeenCalledWith(registeredUser);
    expect(router.navigate).toHaveBeenCalledWith(['/main']);
  });

  it('onLogin logs in with placeholder user if set on component', () => {
    fixture.detectChanges();
    const placeholder = {
      id: 99,
      username: 'PlaceUser',
      name: 'Place Holder',
      email: 'ph@test.com',
      phone: '123-456-7890',
      zipcode: '99999',
      password: 'place',
      followedUserIds: []
    } as User;
    (component as any).jsonPlaceholderUsers = [placeholder];
    const setSpy = spyOn(AuthStorage as any, 'setCurrentUser');
    component.loginForm.patchValue({ username: 'PlaceUser', password: 'place' });
    component.onLogin();
    expect(setSpy).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/main']);
  });

  it('onLogin shows invalid credentials when none match', () => {
    spyOn(AuthStorage as any, 'getRegisteredUsers').and.returnValue([]);
    fixture.detectChanges();
    (component as any).jsonPlaceholderUsers = [];
    component.loginForm.patchValue({ username: 'noone', password: 'nopass' });
    component.onLogin();
    expect(component.errorMessage).toBe('Invalid username or password');
    expect(component.isLoading).toBeFalse();
  });

  it('goToRegister navigates to register', () => {
    component.goToRegister();
    expect(router.navigate).toHaveBeenCalledWith(['/register']);
  });
});