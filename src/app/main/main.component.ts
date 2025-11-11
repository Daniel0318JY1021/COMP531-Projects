import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User, AuthStorage } from '../auth/auth.models';
import { ArticlesService, Article } from '../services/articles.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
    currentUser: User | null = null;
    searchKeyword: string = '';
    newHeadline: string = '';
    newArticleText: string = '';
    articles: Article[] = [];
    loading: boolean = false;
    testResults: string[] = [];

    constructor(
        private router: Router,
        private articlesService: ArticlesService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.currentUser = AuthStorage.getCurrentUser();
        if (!this.currentUser) {
            this.router.navigate(['/auth']);
        } else {
            this.loadArticles();
        }
    }

    updateHeadline(): void {
        if (this.currentUser && this.newHeadline.trim()) {
            const updatedUser = {
                ...this.currentUser,
                headline: this.newHeadline
            };
            AuthStorage.updateUser(updatedUser);
            this.currentUser = updatedUser;
            this.newHeadline = '';
        }
    }

    loadArticles(): void {
        this.loading = true;
        this.articlesService.getArticles().subscribe({
            next: (articles) => {
                this.articles = articles;
                this.loading = false;
                this.addTestResult('✅ GET /articles - Success');
            },
            error: (error) => {
                console.error('Failed to load articles:', error);
                this.loading = false;
                this.addTestResult('❌ GET /articles - Failed: ' + error.message);
            }
        });
    }

    postArticle(): void {
        if (this.newArticleText.trim()) {
            this.articlesService.postArticle(this.newArticleText).subscribe({
                next: (response) => {
                    this.newArticleText = '';
                    this.loadArticles(); // Reload articles
                    this.addTestResult('✅ POST /article - Success');
                },
                error: (error) => {
                    console.error('Failed to post article:', error);
                    this.addTestResult('❌ POST /article - Failed: ' + error.message);
                }
            });
        }
    }

    testApiEndpoints(): void {
        this.testResults = [];
        this.addTestResult('🧪 Starting API tests...');
        
        // Test GET /articles
        this.loadArticles();
        
        // You can add more tests here as needed
    }

    private addTestResult(message: string): void {
        this.testResults.push(`[${new Date().toLocaleTimeString()}] ${message}`);
    }

    logout(): void {
        AuthStorage.clearCurrentUser();
        this.router.navigate(['/auth']);
    }

    goToProfile(): void {
        this.router.navigate(['/profile']);
    }
}