/**
 * User interface - represents a user in the system
 */
export interface User {
    id: number;
    username: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    zipcode?: string;
    dob?: string;
    headline?: string;
    avatar?: string;
    followedUserIds?: number[];
}

/**
 * Authentication response interface
 */
export interface AuthResponse {
    success: boolean;
    user?: User;
    message?: string;
}

/**
 * Registration data interface
 */
export interface RegistrationData {
    username: string;
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
    phone: string;
    zipcode: string;
    dob: string;
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
    username: string;
    password: string;
}

/**
 * JSONPlaceholder user interface (from API)
 */
export interface JSONPlaceholderUser {
    id: number;
    name: string;
    username: string;
    email: string;
    address: {
        street: string;
        suite: string;
        city: string;
        zipcode: string;
        geo: {
            lat: string;
            lng: string;
        };
    };
    phone: string;
    website: string;
    company: {
        name: string;
        catchPhrase: string;
        bs: string;
    };
}

/**
 * AuthStorage class - handles localStorage operations for authentication
 */
export class AuthStorage {
    private static readonly STORAGE_KEY = 'currentUser';
    private static readonly LOGIN_STATE_KEY = 'isLoggedIn';
    private static readonly REGISTERED_USERS_KEY = 'registeredUsers';

    /**
     * Set current user in localStorage
     */
    static setCurrentUser(user: User): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem(this.LOGIN_STATE_KEY, 'true');
    }

    /**
     * Get current user from localStorage
     */
    static getCurrentUser(): User | null {
        const userStr = localStorage.getItem(this.STORAGE_KEY);
        if (!userStr) {
            return null;
        }
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error('Error parsing user data:', e);
            return null;
        }
    }

    /**
     * Update current user in localStorage
     */
    static updateUser(user: User): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    }

    /**
     * Clear current user from localStorage
     */
    static clearCurrentUser(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.LOGIN_STATE_KEY);
    }

    /**
     * Check if user is logged in
     */
    static isLoggedIn(): boolean {
        return localStorage.getItem(this.LOGIN_STATE_KEY) === 'true' && 
               this.getCurrentUser() !== null;
    }

    /**
     * Get user by ID (from a list of users)
     */
    static getUserById(id: number, users: User[]): User | undefined {
        return users.find(u => u.id === id);
    }

    /**
     * Get all registered users from localStorage
     */
    static getRegisteredUsers(): User[] {
        const usersStr = localStorage.getItem(this.REGISTERED_USERS_KEY);
        if (!usersStr) {
            return [];
        }
        try {
            return JSON.parse(usersStr);
        } catch (e) {
            console.error('Error parsing registered users:', e);
            return [];
        }
    }

    /**
     * Add a newly registered user to localStorage
     */
    static addRegisteredUser(user: User): void {
        const users = this.getRegisteredUsers();
        users.push(user);
        localStorage.setItem(this.REGISTERED_USERS_KEY, JSON.stringify(users));
    }

    /**
     * Clear all registered users (for testing)
     */
    static clearRegisteredUsers(): void {
        localStorage.removeItem(this.REGISTERED_USERS_KEY);
    }
}

/**
 * Auth Guard - can be used to protect routes
 */
export class AuthGuard {
    static canActivate(): boolean {
        if (!AuthStorage.isLoggedIn()) {
            return false;
        }
        return true;
    }
}