import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PostsService, Post, Comment } from './posts.service';

describe('PostsService (extended coverage)', () => {
  let service: PostsService;
  let httpMock: HttpTestingController;

  const sampleApiPosts: Partial<Post>[] = [
    { id: 1, userId: 1, title: 'T1', body: 'B1' },
    { id: 2, userId: 1, title: 'T2', body: 'B2' }
  ];

  const sampleComments: Partial<Comment>[] = [
    { postId: 1, id: 11, name: 'C1', email: 'c1@test', body: 'cbody1' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PostsService]
    });

    service = TestBed.inject(PostsService);
    httpMock = TestBed.inject(HttpTestingController);
    (service as any).posts = [];
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loadPosts should fetch posts and add author/timestamp', (done) => {
    service.loadPosts().subscribe(posts => {
      expect(posts.length).toBe(2);
      expect(typeof posts[0].timestamp).toBe('number');
      expect(posts[0].author).toBe(`User ${sampleApiPosts[0].userId}`);
      expect((service as any).posts).toBe(posts);
      done();
    });

    const req = httpMock.expectOne(r => r.method === 'GET' && r.url.includes('/posts'));
    req.flush(sampleApiPosts);
  });

  it('loadPosts should handle empty API response', (done) => {
    service.loadPosts().subscribe(posts => {
      expect(Array.isArray(posts)).toBeTrue();
      expect(posts.length).toBe(0);
      done();
    });

    const req = httpMock.expectOne(r => r.method === 'GET' && r.url.includes('/posts'));
    req.flush([]);
  });

  it('loadComments should fetch comments for a post', (done) => {
    service.loadComments(1).subscribe(comments => {
      expect(Array.isArray(comments)).toBeTrue();
      expect(comments.length).toBe(1);
      expect(comments[0].postId).toBe(1);
      done();
    });

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts/1/comments');
    expect(req.request.method).toBe('GET');
    req.flush(sampleComments);
  });

  it('getPostsForUser should filter and sort by timestamp desc', () => {
    const posts: Post[] = [
      { id: 1, userId: 1, title: 'A', body: 'a', timestamp: 100 },
      { id: 2, userId: 2, title: 'B', body: 'b', timestamp: 200 },
      { id: 3, userId: 3, title: 'C', body: 'c', timestamp: 50 }
    ];
    const result = service.getPostsForUser(posts, 1, [2]);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(2);
    expect(result[1].id).toBe(1);
  });

  it('getPostsForUser with no matches returns empty array', () => {
    const posts: Post[] = [{ id: 1, userId: 2, title: 'A', body: 'a', timestamp: 100 }];
    const result = service.getPostsForUser(posts, 99, []);
    expect(result).toEqual([]);
  });

  it('filterPosts should return all when searchTerm empty and filter by title/body/author', () => {
    const posts: Post[] = [
      { id: 1, userId: 1, title: 'Hello World', body: 'content', author: 'Alice', timestamp: 1 },
      { id: 2, userId: 2, title: 'Other', body: 'hello there', author: 'Bob', timestamp: 2 }
    ];

    expect(service.filterPosts(posts, '').length).toBe(2);
    expect(service.filterPosts(posts, 'hello').length).toBe(2);
    expect(service.filterPosts(posts, 'alice').length).toBe(1);
  });

  it('filterPosts handles whitespace-only term and undefined author', () => {
    const posts: Post[] = [
      { id: 1, userId: 1, title: 'Title', body: 'Body', timestamp: 1 },
      { id: 2, userId: 2, title: 'Other', body: 'More', author: 'Someone', timestamp: 2 }
    ];

    expect(service.filterPosts(posts, '   ').length).toBe(2);
    expect(service.filterPosts(posts, 'someone').length).toBe(1);
  });

  it('addPost should POST and prepend created post to internal array', (done) => {
    (service as any).posts = [];

    const newPostReq = { title: 'New', body: 'New body', userId: 5 };
    const apiResponse = { id: 123 };

    service.addPost(newPostReq).subscribe(created => {
      expect(created.id).toBe(apiResponse.id);
      const internalPosts: Post[] = (service as any).posts;
      expect(internalPosts.length).toBe(1);
      expect(internalPosts[0].id).toBe(apiResponse.id);
      expect(internalPosts[0].author).toBe(`User ${newPostReq.userId}`);
      done();
    });

    const req = httpMock.expectOne(r => r.method === 'POST' && r.url.includes('/posts'));
    expect(req.request.body.title).toBe(newPostReq.title);
    req.flush(apiResponse);
  });

  it('addPost prepends to existing internal posts array', (done) => {
    (service as any).posts = [{ id: 10, userId: 2, title: 'Old', body: 'Old', timestamp: 1, author: 'User 2' }];

    const newPostReq = { title: 'New2', body: 'New body 2', userId: 7 };
    const apiResponse = { id: 999 };

    service.addPost(newPostReq).subscribe(created => {
      expect(created.id).toBe(apiResponse.id);
      const internalPosts: Post[] = (service as any).posts;
      expect(internalPosts.length).toBe(2);
      expect(internalPosts[0].id).toBe(apiResponse.id);
      expect(internalPosts[1].id).toBe(10);
      done();
    });

    const req = httpMock.expectOne(r => r.method === 'POST' && r.url.includes('/posts'));
    req.flush(apiResponse);
  });
});