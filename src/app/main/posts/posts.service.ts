import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthStorage } from '../../auth/auth.models';

export interface Post {
    id: number;
    userId: number;
    title: string;
    body: string;
    author?: string;
    timestamp?: number;
    image?: string;
}

export interface Comment {
    postId: number;
    id: number;
    name: string;
    email: string;
    body: string;
}

@Injectable({
    providedIn: 'root'
})
export class PostsService {
    private posts: Post[] = [];

    constructor(private http: HttpClient) { }

    loadPosts(): Observable<Post[]> {
        return this.http.get<Post[]>('https://jsonplaceholder.typicode.com/posts').pipe(
            map(posts => {
                this.posts = posts.map(post => ({
                    ...post,
                    timestamp: Date.now() - Math.random() * 10000000000,
                    author: `User ${post.userId}`
                }));
                return this.posts;
            })
        );
    }

    loadComments(postId: number): Observable<Comment[]> {
        return this.http.get<Comment[]>(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`);
    }

    getPostsForUser(allPosts: Post[], userId: number, followedUserIds?: number[]): Post[] {
        const userIds = [userId, ...(followedUserIds || [])];
        return allPosts
            .filter(post => userIds.includes(post.userId))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }

    filterPosts(posts: Post[], searchTerm: string): Post[] {
        if (!searchTerm || !searchTerm.trim()) {
            return posts;
        }

        const term = searchTerm.toLowerCase();
        return posts.filter(post =>
            post.title.toLowerCase().includes(term) ||
            post.body.toLowerCase().includes(term) ||
            post.author?.toLowerCase().includes(term)
        );
    }

    addPost(post: { title: string; body: string; userId: number }): Observable<Post> {
        const newPost: Post = {
            id: this.posts.length + 1,
            userId: post.userId,
            title: post.title,
            body: post.body,
            timestamp: Date.now(),
            author: `User ${post.userId}`
        };

        return this.http.post<Post>('https://jsonplaceholder.typicode.com/posts', newPost).pipe(
            map(response => {
                const createdPost = { ...newPost, id: response.id };
                this.posts.unshift(createdPost);
                return createdPost;
            })
        );
    }
}