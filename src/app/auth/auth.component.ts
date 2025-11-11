import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User, AuthStorage } from './auth.models';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
    loginForm!: FormGroup;
    errorMessage: string = '';
    isLoading: boolean = false;
    apiTestMessage: string = '';

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]]
        });

        // Check if user is already logged in
        if (AuthStorage.getCurrentUser()) {
            this.router.navigate(['/main']);
        }
    }

    onLogin(): void {
        if (this.loginForm.invalid) {
            this.errorMessage = 'Please fill in all required fields';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.apiTestMessage = 'Attempting to connect to backend...';

        const { username, password } = this.loginForm.value;

        this.authService.login(username, password).subscribe({
            next: (response) => {
                this.isLoading = false;
                if (response.success && response.user) {
                    this.apiTestMessage = 'Successfully connected to backend!';
                    setTimeout(() => {
                        this.router.navigate(['/main']);
                    }, 1000);
                } else {
                    this.errorMessage = response.message || 'Login failed';
                    this.apiTestMessage = '';
                }
            },
            error: (error) => {
                this.isLoading = false;
                console.error('Login error:', error);
                
                if (error.status === 0) {
                    this.errorMessage = 'Cannot connect to backend server. Make sure it is running on localhost:3000';
                    this.apiTestMessage = '❌ Backend connection failed - CORS error or server not running';
                } else {
                    this.errorMessage = error.error?.message || 'Login failed';
                    this.apiTestMessage = `❌ Backend error: ${error.status} ${error.statusText}`;
                }
            }
        });
    }

    goToRegister(): void {
        this.router.navigate(['/register']);
    }
}