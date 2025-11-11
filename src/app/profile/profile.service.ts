import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User, AuthStorage } from '../auth/auth.models';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private jsonPlaceholderUsers: User[] = [];
  private usersLoaded = false;

  constructor(private http: HttpClient) {
    // 只在非测试环境加载
    if (!(window as any).jasmine) {
      this.loadJsonPlaceholderUsers();
    }
  }

  private loadJsonPlaceholderUsers(): void {
    if (this.usersLoaded) return;

    this.http.get<any[]>('https://jsonplaceholder.typicode.com/users')
      .subscribe({
        next: (users) => {
          this.jsonPlaceholderUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            password: user.username.toLowerCase().substring(0, 5),
            phone: user.phone,
            zipcode: user.address?.zipcode,
            followedUserIds: []
          }));
          this.usersLoaded = true;
        }
      });
  }

  updateProfile(updates: Partial<User>): Observable<{ success: boolean; message?: string }> {
    const currentUser = AuthStorage.getCurrentUser();

    if (!currentUser) {
      return of({ success: false, message: 'No user logged in' });
    }

    if (updates.email && !this.validateEmail(updates.email)) {
      return of({ success: false, message: 'Invalid email format' });
    }

    if (updates.phone && !this.validatePhone(updates.phone)) {
      return of({ success: false, message: 'Invalid phone format. Use: 123-456-7890' });
    }

    if (updates.zipcode && !this.validateZipcode(updates.zipcode)) {
      return of({ success: false, message: 'Invalid zipcode format. Use 5 digits' });
    }

    const updatedUser: User = {
      ...currentUser,
      ...updates,
      username: currentUser.username,
      id: currentUser.id
    };

    AuthStorage.updateUser(updatedUser);

    return of({ success: true, message: 'Profile updated successfully' });
  }

  addFollower(userId: number): Observable<{ success: boolean; message?: string }> {
    const currentUser = AuthStorage.getCurrentUser();

    if (!currentUser) {
      return of({ success: false, message: 'No user logged in' });
    }

    if (currentUser.id === userId) {
      return of({ success: false, message: 'Cannot follow yourself' });
    }

    const followedUserIds = currentUser.followedUserIds || [];

    if (followedUserIds.includes(userId)) {
      return of({ success: false, message: 'Already following this user' });
    }

    const updatedUser: User = {
      ...currentUser,
      followedUserIds: [...followedUserIds, userId]
    };

    AuthStorage.updateUser(updatedUser);

    return of({ success: true, message: 'User followed successfully' });
  }

  removeFollower(userId: number): Observable<{ success: boolean; message?: string }> {
    const currentUser = AuthStorage.getCurrentUser();

    if (!currentUser) {
      return of({ success: false, message: 'No user logged in' });
    }

    const followedUserIds = currentUser.followedUserIds || [];

    if (!followedUserIds.includes(userId)) {
      return of({ success: false, message: 'Not following this user' });
    }

    const updatedUser: User = {
      ...currentUser,
      followedUserIds: followedUserIds.filter(id => id !== userId)
    };

    AuthStorage.updateUser(updatedUser);

    return of({ success: true, message: 'User unfollowed successfully' });
  }

  getFollowedUsers(): User[] {
    const currentUser = AuthStorage.getCurrentUser();

    if (!currentUser) {
      return [];
    }

    const allUsers = [...this.jsonPlaceholderUsers, ...AuthStorage.getRegisteredUsers()];
    const followedUserIds = currentUser.followedUserIds || [];

    return allUsers.filter(user => followedUserIds.includes(user.id));
  }

  getAllUsers(): User[] {
    return [...this.jsonPlaceholderUsers, ...AuthStorage.getRegisteredUsers()];
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePhone(phone: string): boolean {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  }

  private validateZipcode(zipcode: string): boolean {
    const zipRegex = /^\d{5}$/;
    return zipRegex.test(zipcode);
  }
}