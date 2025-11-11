import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProfileService } from './profile.service';
import { User, AuthStorage } from '../auth/auth.models';

describe('ProfileService', () => {
  let service: ProfileService;

  const mockRegisteredUsers: User[] = [
    { id: 2, username: 'user2', name: 'User 2', email: 'u2@test.com', password: 'pass2', phone: '', zipcode: '', followedUserIds: [] },
    { id: 3, username: 'user3', name: 'User 3', email: 'u3@test.com', password: 'pass3', phone: '', zipcode: '', followedUserIds: [] }
  ];

  const mockCurrentUser: User = {
    id: 1,
    username: 'current',
    name: 'Current User',
    email: 'current@test.com',
    password: 'pass',
    phone: '123-456-7890',
    zipcode: '12345',
    followedUserIds: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProfileService]
    });
    service = TestBed.inject(ProfileService);
  });

  afterEach(() => {
    localStorage.clear();
    try { (AuthStorage as any).getCurrentUser?.and?.callThrough?.(); } catch { }
    try { (AuthStorage as any).updateUser?.and?.callThrough?.(); } catch { }
    try { (AuthStorage as any).getRegisteredUsers?.and?.callThrough?.(); } catch { }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('updateProfile', () => {
    it('returns error when no user logged in', (done) => {
      spyOn(AuthStorage as any, 'getCurrentUser').and.returnValue(null);
      service.updateProfile({ name: 'X' }).subscribe(res => {
        expect(res.success).toBeFalse();
        expect(res.message).toContain('No user logged in');
        done();
      });
    });

    it('rejects invalid email', (done) => {
      spyOn(AuthStorage as any, 'getCurrentUser').and.returnValue(mockCurrentUser as User);
      service.updateProfile({ email: 'invalid' }).subscribe(res => {
        expect(res.success).toBeFalse();
        expect(res.message).toContain('Invalid email');
        done();
      });
    });

    it('rejects invalid phone', (done) => {
      spyOn(AuthStorage as any, 'getCurrentUser').and.returnValue(mockCurrentUser as User);
      service.updateProfile({ phone: '1234567890' }).subscribe(res => {
        expect(res.success).toBeFalse();
        expect(res.message).toContain('Invalid phone');
        done();
      });
    });

    it('rejects invalid zipcode', (done) => {
      spyOn(AuthStorage as any, 'getCurrentUser').and.returnValue(mockCurrentUser as User);
      service.updateProfile({ zipcode: 'ABCDE' }).subscribe(res => {
        expect(res.success).toBeFalse();
        expect(res.message).toContain('Invalid zipcode');
        done();
      });
    });

    it('updates profile successfully and preserves id/username', (done) => {
      spyOn(AuthStorage as any, 'getCurrentUser').and.returnValue(mockCurrentUser as User);
      const updateSpy = spyOn(AuthStorage as any, 'updateUser');
      const updates: Partial<User> = { id: 999, username: 'hacker', name: 'New Name', email: 'new@test.com' };

      service.updateProfile(updates).subscribe(res => {
        expect(res.success).toBeTrue();
        expect(updateSpy).toHaveBeenCalled();
        const updatedArg: User = updateSpy.calls.mostRecent().args[0] as User;
        expect(updatedArg.id).toBe(mockCurrentUser.id);
        expect(updatedArg.username).toBe(mockCurrentUser.username);
        expect(updatedArg.name).toBe('New Name');
        done();
      });
    });
  });

  describe('followers management', () => {
    it('addFollower fails when no current user', (done) => {
      spyOn(AuthStorage as any, 'getCurrentUser').and.returnValue(null);
      service.addFollower(2).subscribe(res => {
        expect(res.success).toBeFalse();
        done();
      });
    });

    it('addFollower fails when following self', (done) => {
      spyOn(AuthStorage as any, 'getCurrentUser').and.returnValue(mockCurrentUser as User);
      service.addFollower(1).subscribe(res => {
        expect(res.success).toBeFalse();
        expect(res.message).toContain('Cannot follow yourself');
        done();
      });
    });

    it('addFollower fails when already following', (done) => {
      const u: User = { ...mockCurrentUser, followedUserIds: [2] };
      spyOn(AuthStorage as any, 'getCurrentUser').and.returnValue(u as User);
      service.addFollower(2).subscribe(res => {
        expect(res.success).toBeFalse();
        expect(res.message).toContain('Already following');
        done();
      });
    });

    it('addFollower succeeds and calls updateUser', (done) => {
      const u: User = { ...mockCurrentUser, followedUserIds: [] };
      spyOn(AuthStorage as any, 'getCurrentUser').and.returnValue(u as User);
      const updateSpy = spyOn(AuthStorage as any, 'updateUser');
      service.addFollower(2).subscribe(res => {
        expect(res.success).toBeTrue();
        expect(updateSpy).toHaveBeenCalled();
        const updated = updateSpy.calls.mostRecent().args[0] as User;
        expect(updated.followedUserIds).toContain(2);
        done();
      });
    });

    it('removeFollower fails when not following', (done) => {
      const u: User = { ...mockCurrentUser, followedUserIds: [] };
      spyOn(AuthStorage as any, 'getCurrentUser').and.returnValue(u as User);
      service.removeFollower(2).subscribe(res => {
        expect(res.success).toBeFalse();
        expect(res.message).toContain('Not following');
        done();
      });
    });

    it('removeFollower succeeds and calls updateUser', (done) => {
      const u: User = { ...mockCurrentUser, followedUserIds: [2, 3] };
      spyOn(AuthStorage as any, 'getCurrentUser').and.returnValue(u as User);
      const updateSpy = spyOn(AuthStorage as any, 'updateUser');
      service.removeFollower(2).subscribe(res => {
        expect(res.success).toBeTrue();
        expect(updateSpy).toHaveBeenCalled();
        const updated = updateSpy.calls.mostRecent().args[0] as User;
        expect(updated.followedUserIds).not.toContain(2);
        done();
      });
    });
  });

  describe('user queries', () => {
    it('getAllUsers returns combined placeholder + registered users', () => {
      (service as any).jsonPlaceholderUsers = [
        { id: 4, username: 'p1', name: 'P1', email: 'p1@test', password: 'p1', phone: '', zipcode: '', followedUserIds: [] } as User
      ] as User[];
      spyOn(AuthStorage as any, 'getRegisteredUsers').and.returnValue(mockRegisteredUsers as User[]);
      const all = service.getAllUsers();
      expect(all.length).toBe(1 + mockRegisteredUsers.length);
      expect(all.some(u => u.id === 4)).toBeTrue();
      expect(all.some(u => u.id === 2)).toBeTrue();
    });

    it('getFollowedUsers returns only followed users', () => {
      (service as any).jsonPlaceholderUsers = [
        { id: 4, username: 'p1', name: 'P1', email: 'p1@test', password: 'p1', phone: '', zipcode: '', followedUserIds: [] } as User
      ] as User[];
      spyOn(AuthStorage as any, 'getRegisteredUsers').and.returnValue(mockRegisteredUsers as User[]);
      const current: User = { ...mockCurrentUser, followedUserIds: [2, 4] };
      spyOn(AuthStorage as any, 'getCurrentUser').and.returnValue(current as User);
      const followed = service.getFollowedUsers();
      expect(followed.length).toBe(2);
      const ids = followed.map(u => u.id).sort();
      expect(ids).toEqual([2, 4]);
    });

    it('getFollowedUsers returns empty when no current user', () => {
      spyOn(AuthStorage as any, 'getCurrentUser').and.returnValue(null);
      const followed = service.getFollowedUsers();
      expect(followed).toEqual([]);
    });
  });
});