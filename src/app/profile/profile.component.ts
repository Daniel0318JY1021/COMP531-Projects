import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from './profile.service';
import { AuthStorage, User } from '../auth/auth.models';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    currentUser: User | null = null;
    profileForm: FormGroup;
    isEditing = false;
    followedUsers: User[] = [];
    newFollowerUsername = '';
    successMessage = '';
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private profileService: ProfileService,
        private router: Router
    ) {
        this.profileForm = this.fb.group({
            username: [{ value: '', disabled: true }], // Username is read-only
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]],
            zipcode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
            dob: [{ value: '', disabled: true }] // DOB is read-only
        });
    }

    ngOnInit(): void {
        this.currentUser = AuthStorage.getCurrentUser();
        
        if (!this.currentUser) {
            this.router.navigate(['/auth']);
            return;
        }

        this.initializeForm();
        this.loadFollowedUsers();
    }

    private initializeForm(): void {
        if (this.currentUser) {
            this.profileForm.patchValue({
                username: this.currentUser.username,
                name: this.currentUser.name,
                email: this.currentUser.email,
                phone: this.currentUser.phone || '',
                zipcode: this.currentUser.zipcode || '',
                dob: this.currentUser.dob || ''
            });
            
            // Disable all fields initially
            this.profileForm.disable();
        }
    }

    private loadFollowedUsers(): void {
        this.followedUsers = this.profileService.getFollowedUsers();
    }

    toggleEdit(): void {
        this.isEditing = !this.isEditing;
        
        if (this.isEditing) {
            // Enable editable fields only
            this.profileForm.get('name')?.enable();
            this.profileForm.get('email')?.enable();
            this.profileForm.get('phone')?.enable();
            this.profileForm.get('zipcode')?.enable();
            // username and dob remain disabled
        } else {
            this.profileForm.disable();
            this.initializeForm();
        }
        
        this.successMessage = '';
        this.errorMessage = '';
    }

    onSubmit(): void {
        if (this.profileForm.invalid) {
            return;
        }

        // Only get values from enabled controls
        const updatedData = {
            ...this.currentUser,
            name: this.profileForm.get('name')?.value,
            email: this.profileForm.get('email')?.value,
            phone: this.profileForm.get('phone')?.value,
            zipcode: this.profileForm.get('zipcode')?.value
        };

        this.profileService.updateProfile(updatedData).subscribe(response => {
            if (response.success) {
                this.currentUser = updatedData;
                AuthStorage.updateUser(updatedData);
                this.successMessage = 'Profile updated successfully!';
                this.errorMessage = '';
                this.isEditing = false;
                this.profileForm.disable();
                
                setTimeout(() => {
                    this.successMessage = '';
                }, 3000);
            } else {
                this.errorMessage = response.message || 'Failed to update profile';
                this.successMessage = '';
            }
        });
    }

    addFollower(): void {
        this.successMessage = '';
        this.errorMessage = '';

        if (!this.newFollowerUsername.trim()) {
            this.errorMessage = 'Please enter a username';
            return;
        }

        // Check if already following
        const alreadyFollowing = this.followedUsers.some(
            user => user.username.toLowerCase() === this.newFollowerUsername.toLowerCase()
        );

        if (alreadyFollowing) {
            this.errorMessage = 'You are already following this user';
            return;
        }

        // Find user by username
        const allUsers = this.profileService.getAllUsers();
        const userToFollow = allUsers.find(
            user => user.username.toLowerCase() === this.newFollowerUsername.toLowerCase()
        );

        if (!userToFollow) {
            this.errorMessage = `User '${this.newFollowerUsername}' not found`;
            return;
        }

        // Don't follow yourself
        if (userToFollow.id === this.currentUser?.id) {
            this.errorMessage = 'You cannot follow yourself';
            return;
        }

        this.profileService.addFollower(userToFollow.id).subscribe(response => {
            if (response.success) {
                this.successMessage = response.message || 'Follower added successfully!';
                this.errorMessage = '';
                this.newFollowerUsername = '';
                this.loadFollowedUsers();
                
                setTimeout(() => {
                    this.successMessage = '';
                }, 3000);
            } else {
                this.errorMessage = response.message || 'Failed to add follower';
                this.successMessage = '';
            }
        });
    }

    unfollow(userId: number): void {
        this.successMessage = '';
        this.errorMessage = '';

        this.profileService.removeFollower(userId).subscribe(response => {
            if (response.success) {
                this.successMessage = 'Unfollowed successfully!';
                this.errorMessage = '';
                this.loadFollowedUsers();
                
                setTimeout(() => {
                    this.successMessage = '';
                }, 3000);
            } else {
                this.errorMessage = response.message || 'Failed to unfollow';
                this.successMessage = '';
            }
        });
    }

    backToMain(): void {
        this.router.navigate(['/main']);
    }
}