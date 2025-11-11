import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { ProfileService } from './profile.service';
import { AuthStorage, User } from '../auth/auth.models';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let profileService: jasmine.SpyObj<ProfileService>;
  let router: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    name: 'Test User',
    email: 'test@test.com',
    password: 'password123',
    phone: '123-456-7890',
    zipcode: '77005',
    dob: '1990-01-01'
  };

  beforeEach(async () => {
    const profileServiceSpy = jasmine.createSpyObj('ProfileService', [
      'getFollowedUsers',
      'getAllUsers',
      'updateProfile',
      'addFollower',
      'removeFollower'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    profileService = TestBed.inject(ProfileService) as jasmine.SpyObj<ProfileService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    profileService.getFollowedUsers.and.returnValue([]);
    profileService.getAllUsers.and.returnValue([]);
    profileService.updateProfile.and.returnValue(of({ success: true, message: 'Updated' }));
    profileService.addFollower.and.returnValue(of({ success: true, message: 'Follower added' }));
    profileService.removeFollower.and.returnValue(of({ success: true, message: 'Unfollowed' }));

    spyOn(AuthStorage, 'getCurrentUser').and.returnValue(mockUser);
    spyOn(AuthStorage, 'updateUser');

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch the user\'s profile username', () => {
    fixture.detectChanges();
    expect(component.currentUser).toBeTruthy();
    expect(component.currentUser?.username).toBe('testuser');
    expect(AuthStorage.getCurrentUser).toHaveBeenCalled();
  });

  it('should load user profile on init', () => {
    fixture.detectChanges();
    expect(component.currentUser).toEqual(mockUser);
  });

  it('should initialize profile form with user data', () => {
    fixture.detectChanges();
    expect(component.profileForm.get('username')?.value).toBe('testuser');
    expect(component.profileForm.get('name')?.value).toBe('Test User');
    expect(component.profileForm.get('email')?.value).toBe('test@test.com');
    expect(component.profileForm.get('phone')?.value).toBe('123-456-7890');
    expect(component.profileForm.get('zipcode')?.value).toBe('77005');
    expect(component.profileForm.get('dob')?.value).toBe('1990-01-01');
  });

  it('should disable all form fields initially', () => {
    fixture.detectChanges();
    expect(component.profileForm.get('username')?.disabled).toBe(true);
    expect(component.profileForm.get('name')?.disabled).toBe(true);
    expect(component.profileForm.get('email')?.disabled).toBe(true);
    expect(component.profileForm.get('phone')?.disabled).toBe(true);
    expect(component.profileForm.get('zipcode')?.disabled).toBe(true);
    expect(component.profileForm.get('dob')?.disabled).toBe(true);
  });

  it('should keep username and dob disabled always', () => {
    fixture.detectChanges();
    expect(component.profileForm.get('username')?.disabled).toBe(true);
    expect(component.profileForm.get('dob')?.disabled).toBe(true);
  });

  it('should enter edit mode when toggleEdit is called', () => {
    fixture.detectChanges();
    expect(component.isEditing).toBe(false);
    component.toggleEdit();
    expect(component.isEditing).toBe(true);
    expect(component.profileForm.get('name')?.enabled).toBe(true);
    expect(component.profileForm.get('email')?.enabled).toBe(true);
    expect(component.profileForm.get('phone')?.enabled).toBe(true);
    expect(component.profileForm.get('zipcode')?.enabled).toBe(true);
  });

  it('should exit edit mode when toggleEdit is called again', () => {
    fixture.detectChanges();
    component.toggleEdit();
    expect(component.isEditing).toBe(true);
    component.toggleEdit();
    expect(component.isEditing).toBe(false);
    expect(component.profileForm.disabled).toBe(true);
  });

  it('should clear messages when entering edit mode', () => {
    fixture.detectChanges();
    component.successMessage = 'Success';
    component.errorMessage = 'Error';
    component.toggleEdit();
    expect(component.successMessage).toBe('');
    expect(component.errorMessage).toBe('');
  });

  it('should update profile successfully', fakeAsync(() => {
    fixture.detectChanges();
    component.toggleEdit();
    component.profileForm.patchValue({
      name: 'Updated Name',
      email: 'updated@test.com',
      phone: '987-654-3210',
      zipcode: '12345'
    });
    component.onSubmit();
    tick();
    expect(profileService.updateProfile).toHaveBeenCalled();
    expect(component.successMessage).toBe('Profile updated successfully!');
    expect(component.isEditing).toBe(false);
    expect(AuthStorage.updateUser).toHaveBeenCalled();
    flush(); // 清理所有剩余定时器
  }));

  it('should not submit invalid form', () => {
    fixture.detectChanges();
    component.toggleEdit();
    component.profileForm.patchValue({
      name: '',
      email: 'invalid-email',
      phone: '123',
      zipcode: 'abc'
    });
    component.onSubmit();
    expect(profileService.updateProfile).not.toHaveBeenCalled();
  });

  it('should handle profile update failure', fakeAsync(() => {
    profileService.updateProfile.and.returnValue(
      of({ success: false, message: 'Update failed' })
    );
    fixture.detectChanges();
    component.toggleEdit();
    component.profileForm.patchValue({ name: 'Updated Name' });
    component.onSubmit();
    tick();
    expect(component.errorMessage).toBe('Update failed');
    expect(component.successMessage).toBe('');
    flush();
  }));

  it('should validate email format', () => {
    fixture.detectChanges();
    component.toggleEdit();
    const emailControl = component.profileForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);
    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should validate phone format', () => {
    fixture.detectChanges();
    component.toggleEdit();
    const phoneControl = component.profileForm.get('phone');
    phoneControl?.setValue('123456789');
    expect(phoneControl?.hasError('pattern')).toBe(true);
    phoneControl?.setValue('123-456-7890');
    expect(phoneControl?.hasError('pattern')).toBe(false);
  });

  it('should validate zipcode format', () => {
    fixture.detectChanges();
    component.toggleEdit();
    const zipcodeControl = component.profileForm.get('zipcode');
    zipcodeControl?.setValue('1234');
    expect(zipcodeControl?.hasError('pattern')).toBe(true);
    zipcodeControl?.setValue('12345');
    expect(zipcodeControl?.hasError('pattern')).toBe(false);
  });

  it('should validate all required fields', () => {
    fixture.detectChanges();
    component.toggleEdit();
    const nameControl = component.profileForm.get('name');
    const emailControl = component.profileForm.get('email');
    const phoneControl = component.profileForm.get('phone');
    const zipcodeControl = component.profileForm.get('zipcode');
    nameControl?.setValue('');
    emailControl?.setValue('');
    phoneControl?.setValue('');
    zipcodeControl?.setValue('');
    expect(nameControl?.hasError('required')).toBe(true);
    expect(emailControl?.hasError('required')).toBe(true);
    expect(phoneControl?.hasError('required')).toBe(true);
    expect(zipcodeControl?.hasError('required')).toBe(true);
  });

  it('should load followed users on init', () => {
    const mockFollowers: User[] = [
      { id: 2, username: 'user2', name: 'User 2', email: 'user2@test.com', password: 'pass' }
    ];
    profileService.getFollowedUsers.and.returnValue(mockFollowers);
    fixture.detectChanges();
    expect(component.followedUsers).toEqual(mockFollowers);
    expect(profileService.getFollowedUsers).toHaveBeenCalled();
  });

  it('should add follower successfully', fakeAsync(() => {
    const mockUsers: User[] = [
      { id: 2, username: 'user2', name: 'User 2', email: 'user2@test.com', password: 'pass' }
    ];
    profileService.getAllUsers.and.returnValue(mockUsers);
    profileService.getFollowedUsers.and.returnValue([]);
    fixture.detectChanges();
    component.newFollowerUsername = 'user2';
    component.addFollower();
    tick();
    expect(profileService.addFollower).toHaveBeenCalledWith(2);
    expect(component.successMessage).toContain('Follower added');
    expect(component.newFollowerUsername).toBe('');
    flush();
  }));

  it('should show error when adding empty username', () => {
    fixture.detectChanges();
    component.newFollowerUsername = '';
    component.addFollower();
    expect(component.errorMessage).toBe('Please enter a username');
    expect(profileService.addFollower).not.toHaveBeenCalled();
  });

  it('should prevent adding already followed user', () => {
    const mockFollowers: User[] = [
      { id: 2, username: 'User2', name: 'User 2', email: 'user2@test.com', password: 'pass' }
    ];
    profileService.getFollowedUsers.and.returnValue(mockFollowers);
    fixture.detectChanges();
    component.newFollowerUsername = 'user2';
    component.addFollower();
    expect(component.errorMessage).toBe('You are already following this user');
  });

  it('should show error when user not found', () => {
    profileService.getAllUsers.and.returnValue([]);
    fixture.detectChanges();
    component.newFollowerUsername = 'nonexistent';
    component.addFollower();
    expect(component.errorMessage).toContain('not found');
  });

  it('should prevent following yourself', () => {
    const mockUsers: User[] = [mockUser];
    profileService.getAllUsers.and.returnValue(mockUsers);
    fixture.detectChanges();
    component.newFollowerUsername = 'testuser';
    component.addFollower();
    expect(component.errorMessage).toBe('You cannot follow yourself');
  });

  it('should unfollow user successfully', fakeAsync(() => {
    fixture.detectChanges();
    component.unfollow(2);
    tick();
    expect(profileService.removeFollower).toHaveBeenCalledWith(2);
    expect(component.successMessage).toContain('Unfollowed');
    flush();
  }));

  it('should handle unfollow failure', fakeAsync(() => {
    profileService.removeFollower.and.returnValue(
      of({ success: false, message: 'Unfollow failed' })
    );
    fixture.detectChanges();
    component.unfollow(2);
    tick();
    expect(component.errorMessage).toBe('Unfollow failed');
    flush();
  }));

  it('should clear messages when adding follower', () => {
    fixture.detectChanges();
    component.successMessage = 'Previous success';
    component.errorMessage = 'Previous error';
    component.newFollowerUsername = '';
    component.addFollower();
    expect(component.successMessage).toBe('');
  });

  it('should clear error message before unfollowing', () => {
    fixture.detectChanges();
    component.errorMessage = 'Previous error';
    component.unfollow(2);
    expect(component.errorMessage).toBe('');
  });

  it('should navigate to main when backToMain is called', () => {
    fixture.detectChanges();
    component.backToMain();
    expect(router.navigate).toHaveBeenCalledWith(['/main']);
  });

  it('should navigate to auth when user is not logged in', () => {
    (AuthStorage.getCurrentUser as jasmine.Spy).and.returnValue(null);
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/auth']);
  });

  it('should clear success message after 3 seconds on profile update', fakeAsync(() => {
    fixture.detectChanges();
    component.toggleEdit();
    component.profileForm.patchValue({ name: 'New Name' });
    component.onSubmit();
    tick();
    expect(component.successMessage).toBeTruthy();
    tick(3001);
    expect(component.successMessage).toBe('');
  }));

  it('should clear success message after 3 seconds on add follower', fakeAsync(() => {
    const mockUsers: User[] = [
      { id: 2, username: 'user2', name: 'User 2', email: 'user2@test.com', password: 'pass' }
    ];
    profileService.getAllUsers.and.returnValue(mockUsers);
    profileService.getFollowedUsers.and.returnValue([]);
    fixture.detectChanges();
    component.newFollowerUsername = 'user2';
    component.addFollower();
    tick();
    expect(component.successMessage).toBeTruthy();
    tick(3001);
    expect(component.successMessage).toBe('');
  }));

  it('should clear success message after 3 seconds on unfollow', fakeAsync(() => {
    fixture.detectChanges();
    component.unfollow(2);
    tick();
    expect(component.successMessage).toBeTruthy();
    tick(3001);
    expect(component.successMessage).toBe('');
  }));

  it('should reset form when canceling edit', () => {
    fixture.detectChanges();
    component.toggleEdit();
    component.profileForm.patchValue({
      name: 'Changed Name',
      email: 'changed@test.com'
    });
    component.toggleEdit();
    expect(component.profileForm.get('name')?.value).toBe('Test User');
    expect(component.profileForm.get('email')?.value).toBe('test@test.com');
  });

  it('should handle user with missing optional fields in form', () => {
    const minimalUser: User = {
      id: 1,
      username: 'minimal',
      name: 'Minimal User',
      email: 'minimal@test.com',
      password: 'pass'
    };
    (AuthStorage.getCurrentUser as jasmine.Spy).and.returnValue(minimalUser);
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    profileService = TestBed.inject(ProfileService) as jasmine.SpyObj<ProfileService>;
    profileService.getFollowedUsers.and.returnValue([]);
    fixture.detectChanges();
    expect(component.profileForm.get('phone')?.value).toBe('');
    expect(component.profileForm.get('zipcode')?.value).toBe('');
    expect(component.profileForm.get('dob')?.value).toBe('');
  });

  it('should case-insensitive check for duplicate followers', () => {
    const mockFollowers: User[] = [
      { id: 2, username: 'User2', name: 'User 2', email: 'user2@test.com', password: 'pass' }
    ];
    profileService.getFollowedUsers.and.returnValue(mockFollowers);
    fixture.detectChanges();
    component.newFollowerUsername = 'user2';
    component.addFollower();
    expect(component.errorMessage).toBe('You are already following this user');
  });

  it('should case-insensitive find user to follow', fakeAsync(() => {
    const mockUsers: User[] = [
      { id: 2, username: 'User2', name: 'User 2', email: 'user2@test.com', password: 'pass' }
    ];
    profileService.getAllUsers.and.returnValue(mockUsers);
    profileService.getFollowedUsers.and.returnValue([]);
    fixture.detectChanges();
    component.newFollowerUsername = 'user2';
    component.addFollower();
    tick();
    expect(profileService.addFollower).toHaveBeenCalledWith(2);
    flush();
  }));

  it('should display user email', () => {
    fixture.detectChanges();
    expect(component.currentUser?.email).toBe('test@test.com');
  });

  it('should display user phone', () => {
    fixture.detectChanges();
    expect(component.currentUser?.phone).toBe('123-456-7890');
  });

  it('should retrieve user from AuthStorage on init', () => {
    expect(AuthStorage.getCurrentUser).not.toHaveBeenCalled();
    fixture.detectChanges();
    expect(AuthStorage.getCurrentUser).toHaveBeenCalled();
  });

  it('should only call getCurrentUser once during initialization', () => {
    fixture.detectChanges();
    expect(AuthStorage.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('should handle null current user', () => {
    (AuthStorage.getCurrentUser as jasmine.Spy).and.returnValue(null);
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.currentUser).toBeNull();
  });
});

