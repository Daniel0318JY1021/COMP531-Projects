import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User, AuthStorage } from '../auth.models';

@Injectable({
    providedIn: 'root'
})
export class RegistrationService {
    constructor() { }

    register(userData: Partial<User>): Observable<{ success: boolean; message?: string }> {
        // 验证必填字段
        if (!userData.username || !userData.password || !userData.email || !userData.name) {
            return of({ success: false, message: 'Missing required fields' });
        }

        // 验证数据
        if (!this.validateEmail(userData.email)) {
            return of({ success: false, message: 'Invalid email format' });
        }

        if (userData.phone && !this.validatePhone(userData.phone)) {
            return of({ success: false, message: 'Invalid phone format. Use: 123-456-7890' });
        }

        if (userData.zipcode && !this.validateZipcode(userData.zipcode)) {
            return of({ success: false, message: 'Invalid zipcode format. Use 5 digits' });
        }

        // 检查用户名是否已存在
        const existingUsers = AuthStorage.getRegisteredUsers();
        if (existingUsers.some(u => u.username === userData.username)) {
            return of({ success: false, message: 'Username already exists' });
        }

        // 创建新用户
        const newUser: User = {
            id: Date.now(), // 使用时间戳作为唯一 ID
            username: userData.username!,
            name: userData.name!,
            email: userData.email!,
            password: userData.password!,
            phone: userData.phone,
            zipcode: userData.zipcode,
            dob: userData.dob,
            followedUserIds: []
        };

        // 保存用户
        AuthStorage.addRegisteredUser(newUser);
        AuthStorage.setCurrentUser(newUser);

        return of({ success: true, message: 'Registration successful' });
    }

    validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone: string): boolean {
        const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
        return phoneRegex.test(phone);
    }

    validateZipcode(zipcode: string): boolean {
        const zipRegex = /^\d{5}$/;
        return zipRegex.test(zipcode);
    }
}