import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { 
    User, 
    AuthResponse, 
    RegistrationData, 
    AuthStorage, 
    JSONPlaceholderUser 
} from '../auth/auth.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:3000'; // Backend server URL

    constructor(private http: HttpClient) { }

    /**
     * Login with username and password
     */
    login(username: string, password: string): Observable<AuthResponse> {
        const loginData = { username, password };
        
        return this.http.post<any>(`${this.apiUrl}/login`, loginData, { 
            withCredentials: true // Include cookies for session management
        }).pipe(
            map(response => {
                if (response && response.user) {
                    // Store user info locally
                    const user: User = {
                        id: response.user.id || Date.now(),
                        username: response.user.username,
                        name: response.user.name || response.user.username,
                        email: response.user.email || '',
                        password: '', // Don't store password
                        phone: response.user.phone || '',
                        zipcode: response.user.zipcode || '',
                        followedUserIds: response.user.followedUserIds || []
                    };

                    AuthStorage.setCurrentUser(user);

                    return { 
                        success: true, 
                        user: user,
                        message: response.message || 'Login successful'
                    };
                }
                
                return { 
                    success: false, 
                    message: response.message || 'Login failed' 
                };
            }),
            catchError(error => {
                console.error('Login error:', error);
                return of({ 
                    success: false, 
                    message: error.error?.message || 'Login failed' 
                });
            })
        );
    }

    /**
     * Register a new user
     */
    register(data: RegistrationData): Observable<AuthResponse> {
        // Validate password confirmation
        if (data.password !== data.passwordConfirm) {
            return of({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Prepare registration data for backend
        const registrationData = {
            username: data.username,
            password: data.password,
            name: data.name,
            email: data.email,
            phone: data.phone,
            zipcode: data.zipcode,
            dob: data.dob
        };

        return this.http.post<any>(`${this.apiUrl}/register`, registrationData, {
            withCredentials: true
        }).pipe(
            map(response => {
                if (response && response.user) {
                    const newUser: User = {
                        id: response.user.id || Date.now(),
                        username: response.user.username,
                        name: response.user.name,
                        email: response.user.email,
                        password: '', // Don't store password
                        phone: response.user.phone || '',
                        zipcode: response.user.zipcode || '',
                        dob: response.user.dob,
                        followedUserIds: response.user.followedUserIds || []
                    };

                    // Also save locally as backup
                    AuthStorage.addRegisteredUser(newUser);

                    return { 
                        success: true, 
                        user: newUser,
                        message: response.message || 'Registration successful'
                    };
                }
                
                return { 
                    success: false, 
                    message: response.message || 'Registration failed' 
                };
            }),
            catchError(error => {
                console.error('Registration error:', error);
                return of({ 
                    success: false, 
                    message: error.error?.message || 'Registration failed' 
                });
            })
        );
    }

    /**
     * Logout current user
     */
    logout(): void {
        AuthStorage.clearCurrentUser();
    }

    /**
     * Get initial followers for a user (3 random users)
     */
    private getInitialFollowers(userId: number): number[] {
        const allIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const filtered = allIds.filter(id => id !== userId);
        
        // Return first 3 different users
        return filtered.slice(0, 3);
    }
}