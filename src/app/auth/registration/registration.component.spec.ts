import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegistrationComponent } from './registration.component';
import { RegistrationService } from './registration.service';

describe('RegistrationComponent', () => {
    let component: RegistrationComponent;
    let fixture: ComponentFixture<RegistrationComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let regServiceSpy: jasmine.SpyObj<RegistrationService>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        regServiceSpy = jasmine.createSpyObj('RegistrationService', ['register']);

        await TestBed.configureTestingModule({
            declarations: [RegistrationComponent],
            imports: [ReactiveFormsModule],
            providers: [
                FormBuilder,
                { provide: RegistrationService, useValue: regServiceSpy },
                { provide: Router, useValue: routerSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RegistrationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('ngOnInit builds form', () => {
        expect(component.registerForm).toBeDefined();
        expect(component.registerForm.controls['username']).toBeDefined();
    });

    it('onRegister with invalid form sets errorMessage', () => {
        component.registerForm.patchValue({ username: '', email: 'bad' });
        component.onRegister();
        expect(component.errorMessage).toContain('Please fill in all required fields');
    });

    it('onRegister success navigates after timeout', fakeAsync(() => {
        const resp = { success: true };
        regServiceSpy.register.and.returnValue(of(resp));
        component.registerForm.patchValue({
            username: 'newuser', name: 'N', email: 'n@n.com',
            password: '123456', phone: '123-456-7890', dob: '2000-01-01', zipcode: '12345'
        });

        component.onRegister();
        expect(component.isLoading).toBeTrue();
        tick(1500);
        expect(component.successMessage).toContain('Registration successful');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/main']);
    }));

    it('onRegister when service returns failure shows message and resets loading', () => {
        // 使用合法表单值以进入 service 分支
        regServiceSpy.register.and.returnValue(of({ success: false, message: 'exists' }));
        component.registerForm.patchValue({
            username: 'user1', name: 'N', email: 'e@e.com',
            password: '123456', phone: '123-456-7890', dob: '2000-01-01', zipcode: '12345'
        });
        component.onRegister();
        expect(component.errorMessage).toBe('exists');
        expect(component.isLoading).toBeFalse();
    });

    it('onRegister when service errors sets errorMessage and stops loading', () => {
        // 当 service 抛出错误，error.message 可能被直接赋值到 errorMessage
        regServiceSpy.register.and.returnValue(throwError(() => new Error('fail')));
        component.registerForm.patchValue({
            username: 'user2', name: 'N', email: 'e2@e.com',
            password: '123456', phone: '123-456-7890', dob: '2000-01-01', zipcode: '12345'
        });
        component.onRegister();
        expect(component.errorMessage).toBeTruthy();
        expect(component.isLoading).toBeFalse();
    });

    it('goToLogin navigates to /auth', () => {
        component.goToLogin();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth']);
    });
});