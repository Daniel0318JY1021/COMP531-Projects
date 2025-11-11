import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MainComponent } from './main.component';
import { AuthStorage, User } from '../auth/auth.models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// Stub 用于替代模板中的子组件（避免 "not a known element" 错误）
@Component({ selector: 'app-posts', template: '' })
class StubPostsComponent {
  @Input() searchTerm?: string;
}

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let router: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    name: 'Test User',
    email: 'test@test.com',
    password: 'password123',
    phone: '',
    zipcode: '',
    followedUserIds: []
  };

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [MainComponent, StubPostsComponent],
      imports: [CommonModule, FormsModule, HttpClientTestingModule],
      providers: [{ provide: Router, useValue: routerSpy }]
    }).compileComponents();

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    localStorage.clear();
    try { (AuthStorage as any).getCurrentUser?.and?.callThrough?.(); } catch { }
    try { (AuthStorage as any).updateUser?.and?.callThrough?.(); } catch { }
    try { (AuthStorage as any).clearCurrentUser?.and?.callThrough?.(); } catch { }
  });

  it('should create', () => {
    spyOn(AuthStorage as any, 'getCurrentUser').and.returnValue(mockUser);
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('ngOnInit loads currentUser and does not navigate when user exists', () => {
    spyOn(AuthStorage as any, 'getCurrentUser').and.returnValue(mockUser);
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.currentUser).toEqual(mockUser);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('ngOnInit navigates to /auth when no currentUser', () => {
    spyOn(AuthStorage as any, 'getCurrentUser').and.returnValue(null);
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/auth']);
  });

  it('updateHeadline updates headline when valid', () => {
    spyOn(AuthStorage as any, 'getCurrentUser').and.returnValue(mockUser);
    const updateSpy = spyOn(AuthStorage as any, 'updateUser');
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    component.currentUser = mockUser;
    component.newHeadline = 'New Headline';
    component.updateHeadline();
    expect(updateSpy).toHaveBeenCalled();
    expect(component.currentUser?.headline).toBe('New Headline');
    expect(component.newHeadline).toBe('');
  });

  it('logout clears current user and navigates to /auth', () => {
    const clearSpy = spyOn(AuthStorage as any, 'clearCurrentUser');
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    component.logout();
    expect(clearSpy).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth']);
  });

  it('goToProfile navigates to /profile', () => {
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    component.goToProfile();
    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
  });
});