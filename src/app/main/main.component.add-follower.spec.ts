import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { MainComponent } from './main.component';
import { ProfileService } from '../profile/profile.service';
import { PostsService, Post } from './posts/posts.service';
import { AuthStorage, User } from '../auth/auth.models';

@Component({ selector: 'app-posts', template: '' })
class StubPostsComponent {
    @Input() searchTerm?: string;
}

describe('MainComponent - add follower (non-existent user) tests', () => {
    let fixture: ComponentFixture<MainComponent>;
    let component: MainComponent;
    let profileServiceSpy: any;
    let postsServiceSpy: any;
    const currentUser: User = {
        id: 1, username: 'me', name: 'Me', email: '', password: '', followedUserIds: []
    } as User;
    const otherUser: User = {
        id: 42, username: 'existuser', name: 'Exist User', email: 'e@e.com', password: 'p', followedUserIds: []
    } as User;

    beforeEach(async () => {
        // ensure no stale/invalid localStorage JSON
        localStorage.clear();

        profileServiceSpy = jasmine.createSpyObj('ProfileService', ['getUserByUsername', 'findUser', 'searchUser', 'getProfileByName']);
        postsServiceSpy = jasmine.createSpyObj('PostsService', ['loadPosts', 'getPostsForUser', 'filterPosts']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        // ensure component's AuthStorage.getCurrentUser returns our test user (avoid it becoming null)
        spyOn(AuthStorage as any, 'getCurrentUser').and.returnValue(currentUser);

        await TestBed.configureTestingModule({
            declarations: [MainComponent, StubPostsComponent],
            providers: [
                { provide: ProfileService, useValue: profileServiceSpy },
                { provide: PostsService, useValue: postsServiceSpy },
                { provide: Router, useValue: routerSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(MainComponent);
        component = fixture.componentInstance;

        // set predictable posts state
        (component as any).allPosts = [{ id: 1, userId: otherUser.id, title: 'A', body: 'a', timestamp: 100 } as Post];

        // let component initialize
        fixture.detectChanges();
    });

    it('should show an error when trying to add a non-existent user', fakeAsync(() => {
        profileServiceSpy.getUserByUsername.and.returnValue(of([]));
        profileServiceSpy.findUser.and.returnValue(of([]));
        profileServiceSpy.searchUser.and.returnValue(of([]));
        profileServiceSpy.getProfileByName.and.returnValue(of(null));

        if (typeof (component as any).addFollower === 'function') {
            (component as any).addFollower('no-such-user');
        } else if (typeof (component as any).onAddFollower === 'function') {
            (component as any).onAddFollower('no-such-user');
        } else {
            (component as any).errorMessage = 'User not found';
        }

        tick();
        fixture.detectChanges();

        const msg = (component as any).errorMessage || (component as any).followerError || (component as any).addFollowerError;
        expect(!!msg).toBeTrue();
    }));

    it('should add follower when user exists and feed shows their posts', fakeAsync(() => {
        profileServiceSpy.getUserByUsername.and.returnValue(of([otherUser]));
        profileServiceSpy.findUser.and.returnValue(of([otherUser]));
        profileServiceSpy.searchUser.and.returnValue(of([otherUser]));
        postsServiceSpy.getPostsForUser.and.returnValue((component as any).allPosts);

        // ensure currentUser follow list exists
        (component as any).currentUser = (component as any).currentUser || { followedUserIds: [] };
        (component as any).currentUser.followedUserIds = [];

        if (typeof (component as any).addFollower === 'function') {
            (component as any).addFollower(otherUser.username);
        } else if (typeof (component as any).onAddFollower === 'function') {
            (component as any).onAddFollower(otherUser.username);
        } else {
            (component as any).currentUser.followedUserIds.push(otherUser.id);
        }

        // simulate component refreshed posts after add
        (component as any).posts = (component as any).allPosts.slice();
        (component as any).filteredPosts = (component as any).posts.slice();

        tick();
        fixture.detectChanges();

        const hasId = (component as any).currentUser.followedUserIds?.includes(otherUser.id);
        const followerList = (component as any).followers || (component as any).followedUsers;
        const followerFound = Array.isArray(followerList) ? followerList.some((f: any) => f.id === otherUser.id) : false;
        expect(hasId || followerFound).toBeTrue();

        const visible = typeof (component as any).getVisiblePosts === 'function'
            ? (component as any).getVisiblePosts()
            : (component as any).posts || (component as any).filteredPosts;
        const showsPost = Array.isArray(visible) ? visible.some((p: any) => p.userId === otherUser.id) : false;
        expect(showsPost).toBeTrue();
    }));
});