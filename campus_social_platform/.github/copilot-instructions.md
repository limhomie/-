# Copilot / AI Agent Instructions for 深大校园圈 (campus_social_platform)

## Quick summary ✅
- This is a **static frontend** demo (no backend). Open `index.html` in a browser or use a static server (e.g., VS Code Live Server) to run locally.
- Data is stored in **localStorage** and populated from mock generators when empty.
- No build/test system is present. Use browser DevTools and localStorage to debug and inspect runtime state.

## Architecture & big picture 🔧
- Single-page-ish static site composed of HTML pages and plain JS files (no modules/bundler).
- Key scripts:
  - `js/app.js` — **core app state & UI rendering** (initApp, loadMockData, generateMockData, renderPosts, createPostElement, etc.).
  - `js/auth.js` — **authentication/registration flows and validation**.
  - `js/posts.js` — currently **empty / placeholder** (index.html still includes it).
- Script loading order matters: `index.html` includes `js/app.js` → `js/posts.js` → `js/auth.js`. New code should not rely on modules — add globals or ensure ordering.

## Data models & storage (explicit examples) 💾
- LocalStorage keys used:
  - `campus_social_users` — array of user objects
  - `campus_social_posts` — array of post objects
  - `campus_social_current_user` — currently logged-in user object

- Example user object (see `js/auth.js:completeRegistration`):
```json
{
  "id": 1690000000000,
  "student_id": "2023001001",
  "password": "password123",
  "nickname": "深大程序猿",
  "email": "dev@szu.edu.cn",
  "avatar": "images/avatar1.jpg",
  "bio": "...",
  "tags": ["编程"],
  "is_admin": false
}
```

- Example post object (see `js/app.js:generateMockData`):
```json
{
  "id": 1,
  "user_id": 1,
  "username": "深大程序猿",
  "content": "...",
  "images": ["images/post1-1.jpg"],
  "likes": 45,
  "comments": 12
}
```

## Conventions & important patterns 📌
- Global functions are referenced directly in HTML (e.g., `onclick="editPost(123)"`). These functions must exist on the global scope (`window`) and be loaded before the HTML is used.
- Validation conventions: student ID must be **10 digits** (`/^[0-9]{10}$/`) and password length >= 6 (see `auth.js`).
- IDs for new users are generated with `Date.now()` (e.g., `id: Date.now()`).
- Many behaviors are intentionally simplified/mocked (comments in code indicate where a backend call would be used). Treat `localStorage` as the single source of truth for this demo.

## Developer workflows & debugging ⚠️
- Run: open `index.html` or use Live Server. There is **no build step**.
- Reset test data: clear `localStorage` in DevTools or remove the keys listed above to force `generateMockData()` to re-seed data.
- Debugging: use browser DevTools (Console/Network), inspect `localStorage` and global variables (`posts`, `users`, `currentUser`).

## Where to change common behaviors (guide for agents) 🔍
- To change mock data, edit `js/app.js:generateMockData()`.
- To add post-related logic, prefer adding functions to `js/app.js` or create `js/posts.js` but ensure the function names are global (or attached to `window`) and scripts are included in `index.html` in correct order.
- To add server integration later, replace direct `localStorage` reads/writes with a single data access layer (e.g., helper `api.*` functions). Look for `TODO` / comment markers in `app.js` and `auth.js`.

## Quick examples for common edits 💡
- Add a new global function callable from HTML:
```js
// in app.js (loaded early)
window.myNewAction = function(postId) { /* ... */ }
```
- Query users:
```js
const users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
```

## Constraints & cautions ⚠️
- Passwords are stored in plaintext in this demo — **security is intentionally omitted** for simplicity. Do not rely on current storage for production-level data.
- No tests or CI configuration present — changes should be validated manually in the browser.

---

If you'd like, I can:
- Add a short `README.md` that includes run/debug instructions, or
- Convert `js/posts.js` into a small module that isolates post logic and move relevant functions from `app.js` into it.

请审阅这份草稿并告诉我是否需要加入更多细节或改写成英文。