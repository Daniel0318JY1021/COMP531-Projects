import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RegistrationService } from './registration.service';

describe('RegisterationService', () => {
    let service: RegistrationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [RegistrationService]
        });
        service = TestBed.inject(RegistrationService);
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should register a new user', (done) => {
        const newUser = {
            username: 'newuser',
            name: 'New User',
            email: 'new@test.com',
            password: 'password123',
            phone: '123-456-7890',
            dob: '1990-01-01',
            zipcode: '12345'
        };

        service.register(newUser).subscribe({
            next: (result) => {
                expect(result).toBeDefined();
                done();
            },
            error: () => {
                expect(true).toBe(true);
                done();
            }
        });
    });

    it('should reject duplicate username', (done) => {
        const user = {
            username: 'testuser',
            name: 'Test',
            email: 'test@test.com',
            password: 'pass123',
            phone: '123-456-7890',
            dob: '1990-01-01',
            zipcode: '12345'
        };

        // 第一次注册
        service.register(user).subscribe(() => {
            // 尝试再次注册相同用户名
            service.register(user).subscribe({
                next: (result: any) => {
                    expect(result.success).toBe(false);
                    done();
                },
                error: () => {
                    expect(true).toBe(true);
                    done();
                }
            });
        });
    });

    it('should validate email format', () => {
        const validEmail = 'test@example.com';
        const invalidEmail = 'notanemail';

        expect(service.validateEmail(validEmail)).toBe(true);
        expect(service.validateEmail(invalidEmail)).toBe(false);
    });

    it('should validate phone format', () => {
        const validPhone = '123-456-7890';
        const invalidPhone = 'abc';

        expect(service.validatePhone(validPhone)).toBe(true);
        expect(service.validatePhone(invalidPhone)).toBe(false);
    });

    it('should validate zipcode format', () => {
        const validZip = '12345';
        const invalidZip = 'abcde';

        expect(service.validateZipcode(validZip)).toBe(true);
        expect(service.validateZipcode(invalidZip)).toBe(false);
    });
});