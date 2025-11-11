# folkZone — Social Networking App (COMP 531 Homework)

NetID: ys166  
Frontend (deployed): https://ys166-folkzone.surge.sh

Overview
- Angular frontend for a simple social network: registration, login, feed, follow/unfollow, posts, comments, and profile management.
- Uses JSONPlaceholder for sample data and demonstrates client-side persistence via localStorage.

Features
- User registration and login (local & JSONPlaceholder test users)
- Main feed: posts from current user and followed users, with search/filter
- Create new text-only posts (new posts appear at top)
- Follow / unfollow users — feed updates accordingly
- Load and display comments per post (on demand)
- Profile page: view and update headline (persisted to local storage)
- Unit tests with Jasmine + Karma and code coverage report (Istanbul)

Development (macOS)
1. Install dependencies:
   npm install

2. Run development server:
   ng serve
   Open http://localhost:4200

Unit tests and coverage (macOS)
1. Run tests and generate coverage:
   ng test --watch=false --code-coverage

2. Headless (CI) mode:
   ng test --watch=false --code-coverage --browsers=ChromeHeadless

3. Open coverage report:
   open coverage/index.html || open coverage/*/index.html

Current test/coverage status (most recent run)
- Lines: 93.12% (meets LOC ≥ 90% requirement)
- Statements / Functions / Branches: see coverage report (branches currently lower; consider adding error-branch tests)


