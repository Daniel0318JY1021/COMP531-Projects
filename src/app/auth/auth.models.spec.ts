import { AuthStorage, User, AuthGuard } from './auth.models';

describe('AuthStorage (unit)', () => {
    const sampleUser: User = { id: 1, username: 'u', name: 'U', email: 'e@e', password: 'p', phone: '', zipcode: '', followedUserIds: [] };

    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('setCurrentUser & getCurrentUser & isLoggedIn work', () => {
        AuthStorage.setCurrentUser(sampleUser);
        const got = AuthStorage.getCurrentUser();
        expect(got).toEqual(sampleUser);
        expect(AuthStorage.isLoggedIn()).toBeTrue();
    });

    it('getCurrentUser returns null on invalid JSON', () => {
        localStorage.setItem('currentUser', '{bad json');
        const got = AuthStorage.getCurrentUser();
        expect(got).toBeNull();
    });

    it('updateUser replaces stored user', () => {
        AuthStorage.setCurrentUser(sampleUser);
        const upd: User = { ...sampleUser, name: 'Updated' };
        AuthStorage.updateUser(upd);
        expect(AuthStorage.getCurrentUser()?.name).toBe('Updated');
    });

    it('clearCurrentUser removes storage and login flag', () => {
        AuthStorage.setCurrentUser(sampleUser);
        AuthStorage.clearCurrentUser();
        expect(AuthStorage.getCurrentUser()).toBeNull();
        expect(AuthStorage.isLoggedIn()).toBeFalse();
    });

    it('registered users add/get/clear', () => {
        AuthStorage.clearRegisteredUsers();
        expect(AuthStorage.getRegisteredUsers()).toEqual([]);
        AuthStorage.addRegisteredUser(sampleUser);
        const regs = AuthStorage.getRegisteredUsers();
        expect(regs.length).toBe(1);
        expect(AuthStorage.getUserById(sampleUser.id, regs)).toEqual(sampleUser);
        AuthStorage.clearRegisteredUsers();
        expect(AuthStorage.getRegisteredUsers()).toEqual([]);
    });

    it('AuthGuard.canActivate returns based on isLoggedIn', () => {
        spyOn(AuthStorage as any, 'isLoggedIn').and.returnValue(false);
        expect(AuthGuard.canActivate()).toBeFalse();
        (AuthStorage as any).isLoggedIn.and.returnValue(true);
        expect(AuthGuard.canActivate()).toBeTrue();
    });
});