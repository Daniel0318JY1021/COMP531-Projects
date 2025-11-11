import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PostsComponent } from './posts.component';
import { PostsService, Post, Comment } from './posts.service';
import { AuthStorage, User } from '../../auth/auth.models';

describe('PostsComponent', () => {
    let component: PostsComponent;
    let fixture: ComponentFixture<PostsComponent>;
    let postsServiceSpy: jasmine.SpyObj<PostsService>;
    const currentUser: User = { id: 1, username: 'me', name: 'Me', email: '', password: '', phone: '', zipcode: '', followedUserIds: [2] };

    beforeEach(async () => {
        postsServiceSpy = jasmine.createSpyObj('PostsService', ['loadPosts', 'getPostsForUser', 'filterPosts', 'addPost', 'loadComments']);

        await TestBed.configureTestingModule({
            declarations: [PostsComponent],
            providers: [{ provide: PostsService, useValue: postsServiceSpy }]
        }).compileComponents();

        fixture = TestBed.createComponent(PostsComponent);
        component = fixture.componentInstance;
        (AuthStorage as any).getCurrentUser = jasmine.createSpy().and.returnValue(currentUser);
    });

    afterEach(() => {
        try { (AuthStorage as any).getCurrentUser.and.callThrough(); } catch { }
    });

    it('ngOnInit loads currentUser and calls loadPosts', () => {
        const sample: Post[] = [{ id: 1, userId: 2, title: 't', body: 'b', timestamp: 1 }];
        postsServiceSpy.loadPosts.and.returnValue(of(sample));
        postsServiceSpy.getPostsForUser.and.returnValue(sample);
        postsServiceSpy.filterPosts.and.returnValue(sample);

        fixture.detectChanges();
        expect((AuthStorage as any).getCurrentUser).toHaveBeenCalled();
        expect(component.allPosts).toEqual(sample);
        expect(component.posts).toEqual(sample);
        expect(component.filteredPosts).toEqual(sample);
    });

    it('ngOnChanges updates searchTerm and filters', () => {
        postsServiceSpy.filterPosts.and.returnValue([]);
        component.searchKeyword = 'abc';
        component.ngOnChanges();
        expect(component.searchTerm).toBe('abc');
        expect(component.filteredPosts).toEqual([]);
    });

    it('filterPostsByUser handles no currentUser', () => {
        (AuthStorage as any).getCurrentUser = jasmine.createSpy().and.returnValue(null);
        component.allPosts = [{ id: 1, userId: 2, title: 't', body: 'b' }];
        component.filterPostsByUser();
        expect(component.posts).toEqual([]);
        expect(component.filteredPosts).toEqual([]);
    });

    it('toggleNewPostForm toggles and clears fields', () => {
        component.newPostTitle = 'x';
        component.newPostBody = 'y';
        component.showNewPostForm = false;
        component.toggleNewPostForm();
        expect(component.showNewPostForm).toBeTrue();
        component.toggleNewPostForm();
        expect(component.showNewPostForm).toBeFalse();
        expect(component.newPostTitle).toBe('');
        expect(component.newPostBody).toBe('');
    });

    it('submitNewPost returns when no currentUser', () => {
        (AuthStorage as any).getCurrentUser = jasmine.createSpy().and.returnValue(null);
        const addSpy = postsServiceSpy.addPost.and.returnValue(of({} as Post));
        component.newPostTitle = ' t ';
        component.newPostBody = ' b ';
        component.submitNewPost();
        expect(addSpy).not.toHaveBeenCalled();
    });

    it('submitNewPost with invalid title/body returns', () => {
        component.newPostTitle = '   ';
        component.newPostBody = '   ';
        component.currentUser = currentUser;
        postsServiceSpy.addPost.and.returnValue(of({} as Post));
        component.submitNewPost();
        expect(postsServiceSpy.addPost).not.toHaveBeenCalled();
    });

    it('submitNewPost with valid data calls addPost and updates lists', () => {
        const newPost: Post = { id: 99, userId: 1, title: 'N', body: 'B', timestamp: 5, author: 'User 1' };
        component.currentUser = currentUser;
        component.allPosts = [];
        postsServiceSpy.addPost.and.returnValue(of(newPost));
        postsServiceSpy.getPostsForUser.and.returnValue([newPost]);
        postsServiceSpy.filterPosts.and.returnValue([newPost]);

        component.newPostTitle = 'N';
        component.newPostBody = 'B';
        component.submitNewPost();

        expect(component.allPosts[0]).toEqual(newPost);
        expect(component.newPostTitle).toBe('');
        expect(component.newPostBody).toBe('');
        expect(component.showNewPostForm).toBeFalse();
    });

    it('toggleComments loads comments and toggles flags on success (async)', fakeAsync(() => {
        const comments: Comment[] = [{ postId: 1, id: 1, name: 'c', email: 'e', body: 'b' }];
        // make emission async so loadingComments stays true until tick()
        postsServiceSpy.loadComments.and.returnValue(of(comments).pipe(delay(0)));
        component.toggleComments(1);
        // loadingComments should be true immediately (set before subscribe)
        expect(component.loadingComments[1]).toBeTrue();
        tick(0);
        expect(component.postComments[1]).toEqual(comments);
        expect(component.showComments[1]).toBeTrue();
        expect(component.loadingComments[1]).toBeFalse();
        // calling again should hide
        component.toggleComments(1);
        expect(component.showComments[1]).toBeFalse();
    }));

    it('toggleComments handles load error and clears loading flag (async)', fakeAsync(() => {
        // emit error asynchronously; do not assert immediate loading flag to avoid timing differences
        postsServiceSpy.loadComments.and.returnValue(throwError(() => new Error('fail')).pipe(delay(0)));
        component.toggleComments(2);
        // after asynchronous flush, loadingComments should be cleared
        tick(0);
        expect(component.loadingComments[2]).toBeFalse();
        expect(component.postComments[2]).toBeUndefined();
    }));

    it('getCommentsCount returns length or 0', () => {
        component.postComments[5] = [{ postId: 5, id: 1, name: 'a', email: 'e', body: 'b' }];
        expect(component.getCommentsCount(5)).toBe(1);
        expect(component.getCommentsCount(999)).toBe(0);
    });
});