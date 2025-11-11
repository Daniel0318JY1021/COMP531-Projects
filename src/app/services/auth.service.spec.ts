import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AuthStorage } from '../auth/auth.models';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AuthService]
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
        localStorage.clear();
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // ===== 作业要求的核心测试 =====
    
    it('should log in a previously registered user (login state should be set)', (done) => {
        const username = 'testuser';
        const password = 'password123';

        service.login(username, password).subscribe(response => {
            expect(response.success).toBe(true);
            expect(response.user).toBeDefined();
            expect(response.user?.username).toBe('testuser');
            
            const currentUser = AuthStorage.getCurrentUser();
            expect(currentUser).toBeTruthy();
            expect(currentUser?.username).toBe('testuser');
            
            done();
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=testuser');
        expect(req.request.method).toBe('GET');
        req.flush([
            {
                id: 1,
                username: 'testuser',
                name: 'Test User',
                email: 'test@test.com',
                address: { street: 'password123', zipcode: '77005' },
                phone: '123-456-7890'
            }
        ]);
    });

    it('should not log in an invalid user (error state should be set)', (done) => {
        const username = 'invaliduser';
        const password = 'wrongpassword';

        service.login(username, password).subscribe(response => {
            expect(response.success).toBe(false);
            expect(response.message).toBeTruthy();
            expect(response.message?.toLowerCase()).toMatch(/invalid|not found/);
            
            const currentUser = AuthStorage.getCurrentUser();
            expect(currentUser).toBeNull();
            
            done();
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=invaliduser');
        req.flush([]);
    });

    it('should log out a user (login state should be cleared)', () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            name: 'Test User',
            email: 'test@test.com',
            password: 'password123'
        };
        
        AuthStorage.setCurrentUser(mockUser);
        expect(AuthStorage.getCurrentUser()).toBeTruthy();

        service.logout();

        const currentUser = AuthStorage.getCurrentUser();
        expect(currentUser).toBeNull();
    });

    // ===== 登录功能测试 =====

    it('should fail login with wrong password', (done) => {
        const username = 'testuser';
        const password = 'wrongpassword';

        service.login(username, password).subscribe(response => {
            expect(response.success).toBe(false);
            expect(response.message).toContain('Invalid password');
            done();
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=testuser');
        req.flush([
            {
                id: 1,
                username: 'testuser',
                name: 'Test User',
                email: 'test@test.com',
                address: { street: 'correctpassword', zipcode: '77005' }
            }
        ]);
    });

    it('should store complete user data on successful login', (done) => {
        const username = 'testuser';
        const password = 'password123';

        service.login(username, password).subscribe(response => {
            expect(response.success).toBe(true);
            
            const user = AuthStorage.getCurrentUser();
            expect(user?.id).toBe(1);
            expect(user?.username).toBe('testuser');
            expect(user?.name).toBe('Test User');
            expect(user?.email).toBe('test@test.com');
            expect(user?.password).toBe('password123');
            expect(user?.phone).toBe('123-456-7890');
            expect(user?.zipcode).toBe('77005');
            expect(user?.followedUserIds).toBeDefined();
            
            done();
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=testuser');
        req.flush([
            {
                id: 1,
                username: 'testuser',
                name: 'Test User',
                email: 'test@test.com',
                address: { street: 'password123', zipcode: '77005' },
                phone: '123-456-7890'
            }
        ]);
    });

    it('should assign initial followers on login', (done) => {
        const username = 'testuser';
        const password = 'password123';

        service.login(username, password).subscribe(response => {
            expect(response.success).toBe(true);
            
            const user = AuthStorage.getCurrentUser();
            expect(user?.followedUserIds).toBeDefined();
            expect(user?.followedUserIds?.length).toBe(3);
            expect(user?.followedUserIds).not.toContain(1); // Should not follow self
            
            done();
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=testuser');
        req.flush([
            {
                id: 1,
                username: 'testuser',
                name: 'Test User',
                email: 'test@test.com',
                address: { street: 'password123', zipcode: '77005' }
            }
        ]);
    });

    it('should handle network errors during login', (done) => {
        const username = 'testuser';
        const password = 'password123';

        service.login(username, password).subscribe(response => {
            expect(response.success).toBe(false);
            expect(response.message).toBe('Login failed');
            done();
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=testuser');
        req.error(new ErrorEvent('Network error'));
    });

    it('should store user in localStorage on successful login', (done) => {
        const username = 'testuser';
        const password = 'password123';

        service.login(username, password).subscribe(response => {
            expect(response.success).toBe(true);
            
            const stored = localStorage.getItem('currentUser');
            expect(stored).toBeTruthy();
            
            const user = JSON.parse(stored!);
            expect(user.username).toBe('testuser');
            
            done();
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=testuser');
        req.flush([
            {
                id: 1,
                username: 'testuser',
                name: 'Test User',
                email: 'test@test.com',
                address: { street: 'password123', zipcode: '77005' }
            }
        ]);
    });

    it('should return success message on successful login', (done) => {
        const username = 'testuser';
        const password = 'password123';

        service.login(username, password).subscribe(response => {
            expect(response.success).toBe(true);
            expect(response.message).toBe('Login successful');
            done();
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=testuser');
        req.flush([
            {
                id: 1,
                username: 'testuser',
                name: 'Test User',
                email: 'test@test.com',
                address: { street: 'password123', zipcode: '77005' }
            }
        ]);
    });

    // ===== 注册功能测试 =====

    it('should register a new user successfully', (done) => {
        const newUser = {
            username: 'newuser',
            name: 'New User',
            email: 'new@test.com',
            password: 'password123',
            passwordConfirm: 'password123',
            phone: '123-456-7890',
            zipcode: '77005',
            dob: '2000-01-01'
        };

        service.register(newUser).subscribe(response => {
            expect(response.success).toBe(true);
            expect(response.user).toBeDefined();
            expect(response.user?.username).toBe('newuser');
            expect(response.message).toBe('Registration successful');
            done();
        });

        const checkReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=newuser');
        checkReq.flush([]);

        const createReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
        expect(createReq.request.method).toBe('POST');
        createReq.flush({
            id: 11,
            username: 'newuser',
            name: 'New User',
            email: 'new@test.com'
        });
    });

    it('should validate password confirmation', (done) => {
        const newUser = {
            username: 'testuser',
            name: 'Test User',
            email: 'test@test.com',
            password: 'password123',
            passwordConfirm: 'different',
            phone: '123-456-7890',
            zipcode: '77005',
            dob: '2000-01-01'
        };

        service.register(newUser).subscribe(response => {
            expect(response.success).toBe(false);
            expect(response.message).toBe('Passwords do not match');
            done();
        });
    });

    it('should check if username already exists in API', (done) => {
        const existingUser = {
            username: 'existinguser',
            name: 'Existing User',
            email: 'existing@test.com',
            password: 'password123',
            passwordConfirm: 'password123',
            phone: '123-456-7890',
            zipcode: '77005',
            dob: '2000-01-01'
        };

        service.register(existingUser).subscribe(response => {
            expect(response.success).toBe(false);
            expect(response.message).toBe('Username already exists');
            done();
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=existinguser');
        req.flush([
            {
                id: 1,
                username: 'existinguser',
                name: 'Existing',
                email: 'existing@test.com'
            }
        ]);
    });

    it('should check if username exists in localStorage', (done) => {
        const existingLocalUser = {
            id: 999,
            username: 'localuser',
            name: 'Local User',
            email: 'local@test.com',
            password: 'password123'
        };
        
        AuthStorage.addRegisteredUser(existingLocalUser);

        const newUser = {
            username: 'localuser',
            name: 'New User',
            email: 'new@test.com',
            password: 'password123',
            passwordConfirm: 'password123',
            phone: '123-456-7890',
            zipcode: '77005',
            dob: '2000-01-01'
        };

        service.register(newUser).subscribe(response => {
            expect(response.success).toBe(false);
            expect(response.message).toBe('Username already exists');
            done();
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=localuser');
        req.flush([]);
    });

    it('should save registered user to localStorage', (done) => {
        const newUser = {
            username: 'newuser',
            name: 'New User',
            email: 'new@test.com',
            password: 'password123',
            passwordConfirm: 'password123',
            phone: '123-456-7890',
            zipcode: '77005',
            dob: '2000-01-01'
        };

        service.register(newUser).subscribe(response => {
            expect(response.success).toBe(true);
            
            const registeredUsers = AuthStorage.getRegisteredUsers();
            const found = registeredUsers.find(u => u.username === 'newuser');
            expect(found).toBeDefined();
            expect(found?.name).toBe('New User');
            expect(found?.email).toBe('new@test.com');
            
            done();
        });

        const checkReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=newuser');
        checkReq.flush([]);

        const createReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
        createReq.flush({});
    });

    it('should initialize empty followedUserIds for new user', (done) => {
        const newUser = {
            username: 'newuser',
            name: 'New User',
            email: 'new@test.com',
            password: 'password123',
            passwordConfirm: 'password123',
            phone: '123-456-7890',
            zipcode: '77005',
            dob: '2000-01-01'
        };

        service.register(newUser).subscribe(response => {
            expect(response.success).toBe(true);
            expect(response.user?.followedUserIds).toEqual([]);
            done();
        });

        const checkReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=newuser');
        checkReq.flush([]);

        const createReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
        createReq.flush({});
    });

    it('should handle API error gracefully during registration', (done) => {
        const newUser = {
            username: 'newuser',
            name: 'New User',
            email: 'new@test.com',
            password: 'password123',
            passwordConfirm: 'password123',
            phone: '123-456-7890',
            zipcode: '77005',
            dob: '2000-01-01'
        };

        service.register(newUser).subscribe(response => {
            expect(response.success).toBe(true);
            expect(response.message).toBe('Registration successful');
            
            const registeredUsers = AuthStorage.getRegisteredUsers();
            expect(registeredUsers.some(u => u.username === 'newuser')).toBe(true);
            
            done();
        });

        const checkReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=newuser');
        checkReq.flush([]);

        const createReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
        createReq.error(new ErrorEvent('API Error'));
    });

    it('should handle network error during username check', (done) => {
        const newUser = {
            username: 'newuser',
            name: 'New User',
            email: 'new@test.com',
            password: 'password123',
            passwordConfirm: 'password123',
            phone: '123-456-7890',
            zipcode: '77005',
            dob: '2000-01-01'
        };

        service.register(newUser).subscribe(response => {
            expect(response.success).toBe(false);
            expect(response.message).toBe('Registration failed');
            done();
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=newuser');
        req.error(new ErrorEvent('Network error'));
    });

    it('should generate unique user ID for registered user', (done) => {
        const newUser = {
            username: 'newuser',
            name: 'New User',
            email: 'new@test.com',
            password: 'password123',
            passwordConfirm: 'password123',
            phone: '123-456-7890',
            zipcode: '77005',
            dob: '2000-01-01'
        };

        service.register(newUser).subscribe(response => {
            expect(response.success).toBe(true);
            expect(response.user?.id).toBeDefined();
            expect(response.user?.id).toBeGreaterThan(0);
            done();
        });

        const checkReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=newuser');
        checkReq.flush([]);

        const createReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
        createReq.flush({});
    });

    // ===== 登出功能测试 =====

    it('should clear localStorage on logout', () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            name: 'Test User',
            email: 'test@test.com',
            password: 'password123'
        };
        
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        expect(localStorage.getItem('currentUser')).toBeTruthy();

        service.logout();

        expect(localStorage.getItem('currentUser')).toBeNull();
    });

    it('should handle logout when no user is logged in', () => {
        expect(AuthStorage.getCurrentUser()).toBeNull();
        
        service.logout();
        
        expect(AuthStorage.getCurrentUser()).toBeNull();
    });

    it('should allow re-login after logout', (done) => {
        const username = 'testuser';
        const password = 'password123';

        service.login(username, password).subscribe(response => {
            expect(response.success).toBe(true);
            
            service.logout();
            expect(AuthStorage.getCurrentUser()).toBeNull();
            
            service.login(username, password).subscribe(secondResponse => {
                expect(secondResponse.success).toBe(true);
                expect(AuthStorage.getCurrentUser()).toBeTruthy();
                done();
            });

            const secondReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=testuser');
            secondReq.flush([
                {
                    id: 1,
                    username: 'testuser',
                    name: 'Test User',
                    email: 'test@test.com',
                    address: { street: 'password123', zipcode: '77005' }
                }
            ]);
        });

        const firstReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=testuser');
        firstReq.flush([
            {
                id: 1,
                username: 'testuser',
                name: 'Test User',
                email: 'test@test.com',
                address: { street: 'password123', zipcode: '77005' }
            }
        ]);
    });

    // ===== 边界情况测试 =====

    it('should handle user with different ID getting different followers', (done) => {
        const username = 'user5';
        const password = 'password123';

        service.login(username, password).subscribe(response => {
            expect(response.success).toBe(true);
            
            const user = AuthStorage.getCurrentUser();
            expect(user?.followedUserIds).not.toContain(5);
            expect(user?.followedUserIds?.length).toBe(3);
            
            done();
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=user5');
        req.flush([
            {
                id: 5,
                username: 'user5',
                name: 'User Five',
                email: 'user5@test.com',
                address: { street: 'password123', zipcode: '77005' }
            }
        ]);
    });

    it('should preserve all user fields during registration', (done) => {
        const newUser = {
            username: 'completeuser',
            name: 'Complete User',
            email: 'complete@test.com',
            password: 'SecurePass123',
            passwordConfirm: 'SecurePass123',
            phone: '987-654-3210',
            zipcode: '12345',
            dob: '1995-05-15'
        };

        service.register(newUser).subscribe(response => {
            expect(response.success).toBe(true);
            expect(response.user?.username).toBe('completeuser');
            expect(response.user?.name).toBe('Complete User');
            expect(response.user?.email).toBe('complete@test.com');
            expect(response.user?.password).toBe('SecurePass123');
            expect(response.user?.phone).toBe('987-654-3210');
            expect(response.user?.zipcode).toBe('12345');
            expect(response.user?.dob).toBe('1995-05-15');
            done();
        });

        const checkReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=completeuser');
        checkReq.flush([]);

        const createReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
        createReq.flush({});
    });

    it('should handle multiple users registering sequentially', (done) => {
        const user1 = {
            username: 'user1',
            name: 'User One',
            email: 'user1@test.com',
            password: 'pass1',
            passwordConfirm: 'pass1',
            phone: '111-111-1111',
            zipcode: '11111',
            dob: '1990-01-01'
        };

        const user2 = {
            username: 'user2',
            name: 'User Two',
            email: 'user2@test.com',
            password: 'pass2',
            passwordConfirm: 'pass2',
            phone: '222-222-2222',
            zipcode: '22222',
            dob: '1991-02-02'
        };

        service.register(user1).subscribe(response1 => {
            expect(response1.success).toBe(true);

            service.register(user2).subscribe(response2 => {
                expect(response2.success).toBe(true);
                
                const registeredUsers = AuthStorage.getRegisteredUsers();
                expect(registeredUsers.length).toBeGreaterThanOrEqual(2);
                expect(registeredUsers.some(u => u.username === 'user1')).toBe(true);
                expect(registeredUsers.some(u => u.username === 'user2')).toBe(true);
                
                done();
            });

            const check2Req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=user2');
            check2Req.flush([]);

            const create2Req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
            create2Req.flush({});
        });

        const check1Req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=user1');
        check1Req.flush([]);

        const create1Req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
        create1Req.flush({});
    });

    it('should handle special characters in password', (done) => {
        const username = 'testuser';
        const password = 'P@ssw0rd!#$%';

        service.login(username, password).subscribe(response => {
            expect(response.success).toBe(true);
            expect(response.user?.password).toBe('P@ssw0rd!#$%');
            done();
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=testuser');
        req.flush([
            {
                id: 1,
                username: 'testuser',
                name: 'Test User',
                email: 'test@test.com',
                address: { street: 'P@ssw0rd!#$%', zipcode: '77005' }
            }
        ]);
    });

    it('should handle very long username', (done) => {
        const longUsername = 'a'.repeat(100);
        const password = 'password123';

        service.login(longUsername, password).subscribe(response => {
            expect(response.success).toBe(false);
            expect(response.message).toBe('User not found');
            done();
        });

        const req = httpMock.expectOne(`https://jsonplaceholder.typicode.com/users?username=${longUsername}`);
        req.flush([]);
    });

    it('should maintain registered users list across multiple registrations', (done) => {
        const initialCount = AuthStorage.getRegisteredUsers().length;

        const newUser = {
            username: 'anotheruser',
            name: 'Another User',
            email: 'another@test.com',
            password: 'password123',
            passwordConfirm: 'password123',
            phone: '555-555-5555',
            zipcode: '55555',
            dob: '1992-03-03'
        };

        service.register(newUser).subscribe(response => {
            expect(response.success).toBe(true);
            
            const newCount = AuthStorage.getRegisteredUsers().length;
            expect(newCount).toBe(initialCount + 1);
            
            done();
        });

        const checkReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=anotheruser');
        checkReq.flush([]);

        const createReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
        createReq.flush({});
    });

    it('should return user data in response after registration', (done) => {
        const newUser = {
            username: 'returnuser',
            name: 'Return User',
            email: 'return@test.com',
            password: 'password123',
            passwordConfirm: 'password123',
            phone: '666-666-6666',
            zipcode: '66666',
            dob: '1993-04-04'
        };

        service.register(newUser).subscribe(response => {
            expect(response.success).toBe(true);
            expect(response.user).toBeDefined();
            expect(response.user?.username).toBe('returnuser');
            expect(response.user?.name).toBe('Return User');
            expect(response.user?.email).toBe('return@test.com');
            expect(response.message).toBe('Registration successful');
            done();
        });

        const checkReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=returnuser');
        checkReq.flush([]);

        const createReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
        createReq.flush({});
    });

    // ===== 数据持久化测试 =====

    it('should persist login state in localStorage', (done) => {
        const username = 'persistuser';
        const password = 'password123';

        service.login(username, password).subscribe(response => {
            expect(response.success).toBe(true);
            
            const storedUser = localStorage.getItem('currentUser');
            expect(storedUser).not.toBeNull();
            
            const parsed = JSON.parse(storedUser!);
            expect(parsed.username).toBe('persistuser');
            expect(parsed.id).toBe(7);
            
            done();
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=persistuser');
        req.flush([
            {
                id: 7,
                username: 'persistuser',
                name: 'Persist User',
                email: 'persist@test.com',
                address: { street: 'password123', zipcode: '77005' }
            }
        ]);
    });

    it('should retrieve user from localStorage after page reload simulation', (done) => {
        const username = 'reloaduser';
        const password = 'password123';

        service.login(username, password).subscribe(response => {
            expect(response.success).toBe(true);
            
            const beforeReload = AuthStorage.getCurrentUser();
            expect(beforeReload?.username).toBe('reloaduser');
            
            const afterReload = AuthStorage.getCurrentUser();
            expect(afterReload?.username).toBe('reloaduser');
            expect(afterReload?.id).toBe(beforeReload?.id);
            
            done();
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=reloaduser');
        req.flush([
            {
                id: 8,
                username: 'reloaduser',
                name: 'Reload User',
                email: 'reload@test.com',
                address: { street: 'password123', zipcode: '77005' }
            }
        ]);
    });

    it('should handle POST request body correctly during registration', (done) => {
        const newUser = {
            username: 'postuser',
            name: 'POST User',
            email: 'post@test.com',
            password: 'password123',
            passwordConfirm: 'password123',
            phone: '777-777-7777',
            zipcode: '77777',
            dob: '1994-05-05'
        };

        service.register(newUser).subscribe(response => {
            expect(response.success).toBe(true);
            done();
        });

        const checkReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?username=postuser');
        checkReq.flush([]);

        const createReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
        expect(createReq.request.method).toBe('POST');
        expect(createReq.request.body.username).toBe('postuser');
        expect(createReq.request.body.name).toBe('POST User');
        expect(createReq.request.body.email).toBe('post@test.com');
        expect(createReq.request.body.password).toBe('password123');
        expect(createReq.request.body.followedUserIds).toEqual([]);
        createReq.flush({});
    });
});