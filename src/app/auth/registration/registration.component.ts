import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrationService } from './registration.service';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
    registerForm!: FormGroup;
    errorMessage: string = '';
    successMessage: string = '';
    isLoading: boolean = false;

    constructor(
        private fb: FormBuilder,
        private registrationService: RegistrationService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.registerForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            phone: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]],
            dob: ['', [Validators.required]],
            zipcode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]]
        });
    }

    onRegister(): void {
        if (this.registerForm.invalid) {
            this.errorMessage = 'Please fill in all required fields correctly';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        const userData = this.registerForm.value;

        this.registrationService.register(userData).subscribe({
            next: (result) => {
                if (result.success) {
                    this.successMessage = 'Registration successful! Redirecting...';
                    setTimeout(() => {
                        this.router.navigate(['/main']);
                    }, 1500);
                } else {
                    this.errorMessage = result.message || 'Registration failed';
                    this.isLoading = false;
                }
            },
            error: (error) => {
                this.errorMessage = error.message || 'Registration failed';
                this.isLoading = false;
            }
        });
    }

    goToLogin(): void {
        this.router.navigate(['/auth']);
    }
}