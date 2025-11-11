import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { PostsService, Post, Comment } from './posts.service';
import { AuthStorage, User } from '../../auth/auth.models';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit, OnChanges {
  @Input() searchKeyword: string = '';
  
  currentUser: User | null = null;
  allPosts: Post[] = [];
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  
  searchTerm: string = '';
  showNewPostForm: boolean = false;
  newPostTitle: string = '';
  newPostBody: string = '';
  
  showComments: { [postId: number]: boolean } = {};
  postComments: { [postId: number]: Comment[] } = {};
  loadingComments: { [postId: number]: boolean } = {};

  constructor(private postsService: PostsService) {}

  ngOnInit(): void {
    this.currentUser = AuthStorage.getCurrentUser();
    this.loadPosts();
  }

  ngOnChanges(): void {
    this.searchTerm = this.searchKeyword;
    this.filterPosts();
  }

  loadPosts(): void {
    this.postsService.loadPosts().subscribe({
      next: (posts) => {
        this.allPosts = posts;
        this.filterPostsByUser();
        this.filterPosts();
      },
      error: (error) => {
        console.error('Error loading posts:', error);
      }
    });
  }

  filterPostsByUser(): void {
    if (!this.currentUser) {
      this.posts = [];
      this.filteredPosts = [];
      return;
    }

    this.posts = this.postsService.getPostsForUser(
      this.allPosts,
      this.currentUser.id,
      this.currentUser.followedUserIds
    );
  }

  filterPosts(): void {
    this.filteredPosts = this.postsService.filterPosts(this.posts, this.searchTerm);
  }

  toggleNewPostForm(): void {
    this.showNewPostForm = !this.showNewPostForm;
    if (!this.showNewPostForm) {
      this.newPostTitle = '';
      this.newPostBody = '';
    }
  }

  submitNewPost(): void {
    if (!this.currentUser) {
      return;
    }

    const title = this.newPostTitle.trim();
    const body = this.newPostBody.trim();

    if (!title || !body) {
      return;
    }

    this.postsService.addPost({
      title,
      body,
      userId: this.currentUser.id
    }).subscribe({
      next: (newPost) => {
        this.allPosts.unshift(newPost);
        this.filterPostsByUser();
        this.filterPosts();
        this.newPostTitle = '';
        this.newPostBody = '';
        this.showNewPostForm = false;
      },
      error: (error) => {
        console.error('Error creating post:', error);
      }
    });
  }

  toggleComments(postId: number): void {
    // 如果评论已经显示，则隐藏
    if (this.showComments[postId]) {
      this.showComments[postId] = false;
      return;
    }

    // 如果评论已经加载过，直接显示
    if (this.postComments[postId]) {
      this.showComments[postId] = true;
      return;
    }

    // 🔥 关键修复：在订阅之前同步设置 loading 状态为 true
    this.loadingComments[postId] = true;

    // 加载评论
    this.postsService.loadComments(postId).subscribe({
      next: (comments) => {
        this.postComments[postId] = comments;
        this.showComments[postId] = true;
        this.loadingComments[postId] = false;
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        this.loadingComments[postId] = false;
      }
    });
  }

  getCommentsCount(postId: number): number {
    return this.postComments[postId]?.length || 0;
  }
}