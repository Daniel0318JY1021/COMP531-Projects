import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface Article {
    id: number;
    text: string;
    date: string;
    author: string;
    picture?: string;
    comments?: Comment[];
}

export interface Comment {
    id: number;
    text: string;
    date: string;
    author: string;
}

@Injectable({
    providedIn: 'root'
})
export class ArticlesService {
    private apiUrl = 'http://localhost:3000'; // Backend server URL

    constructor(private http: HttpClient) { }

    /**
     * Get all articles
     */
    getArticles(): Observable<Article[]> {
        return this.http.get<any>(`${this.apiUrl}/articles`, {
            withCredentials: true // Include cookies for session management
        }).pipe(
            map(response => {
                if (response && response.articles) {
                    return response.articles;
                }
                return response || [];
            }),
            catchError(error => {
                console.error('Get articles error:', error);
                return of([]);
            })
        );
    }

    /**
     * Post a new article
     */
    postArticle(text: string, image?: File): Observable<any> {
        const formData = new FormData();
        formData.append('text', text);
        if (image) {
            formData.append('image', image);
        }

        return this.http.post<any>(`${this.apiUrl}/article`, formData, {
            withCredentials: true
        }).pipe(
            catchError(error => {
                console.error('Post article error:', error);
                throw error;
            })
        );
    }

    /**
     * Update an article
     */
    updateArticle(id: number, text: string, commentId?: number): Observable<any> {
        const data = commentId ? { text, commentId } : { text };
        
        return this.http.put<any>(`${this.apiUrl}/articles/${id}`, data, {
            withCredentials: true
        }).pipe(
            catchError(error => {
                console.error('Update article error:', error);
                throw error;
            })
        );
    }
}