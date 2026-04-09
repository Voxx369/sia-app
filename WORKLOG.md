# WORKLOG

## 2026-02-09 - Session 1

### Start state
- Repo contains:
  - `api/` (Express + Postgres)
  - `soulIntoArtProject/` (React + Vite)
  - `pdf SIA/html SIA` with multiple captured HTML exports and `_files` assets.
- Frontend lint baseline had 2 errors:
  - `src/App.jsx` (`react-hooks/set-state-in-effect`)
  - `src/pages/CourseDetail.jsx` (`no-unused-vars`)

### Decisions locked
- One-pass rebuild (public + dashboard).
- Close visual/behavior parity.
- Keep Postgres (no NoSQL migration in this cycle).
- French-first content.
- Informational subscription pages only (no live payments).
- Include registration + legal pages in scope.

### Reference coverage confirmed
- Captured dashboard pages:
  - `/dashboard/my-courses/`
  - `/dashboard/announcements/`
  - `/dashboard/analytics/`
  - `/dashboard/settings/`
  - `/dashboard/withdraw/`
  - `/dashboard/zoom/`
  - `/dashboard/create-course/?course_id=5786#/basics`
  - `/dashboard/create-course/?course_id=5786#/curriculum`
  - `/dashboard/create-course/?course_id=5786#/additional`
- Captured public pages:
  - `/tous-les-cours-en-ligne/`
  - one course detail page (`.../tous-les-cours/...coart/`)
  - `/guide-prix-artistes/`
  - `/mes-revenus-artiste/`

### Next actions
1. Keep lint/build green while expanding routes.
2. Implement canonical route map with compatibility redirects.
3. Build dashboard structure based on captured references.
4. Add backend endpoints needed for dashboard modules.

### Work completed in this session
- Added project execution contract:
  - `codex.md`
- Added persistent session log:
  - `WORKLOG.md`
- Fixed frontend lint blockers:
  - `soulIntoArtProject/src/App.jsx`
    - removed `setState` call inside route-change effect
    - replaced mobile menu behavior with route-key based state
    - kept body scroll lock behavior
  - `soulIntoArtProject/src/pages/CourseDetail.jsx`
    - removed unused `user` variable from auth context destructuring

### Validation run
- `cd soulIntoArtProject && npm run lint` -> PASS
- `cd soulIntoArtProject && npm run build` -> PASS

## 2026-02-09 - Fixes: Reviews Submit + Artists "Decouvrir"

### Fixes
- Reviews UI:
  - `soulIntoArtProject/src/pages/CourseDetail.jsx`:
    - review form button now uses `type="submit"` so the `onSubmit` handler runs
    - added friendly mapping for common API errors (ex: `not_found`, `not_enrolled`)
- Artists:
  - `soulIntoArtProject/src/pages/TousLesArtistes.jsx`:
    - fixed a non-UTF8 bullet byte by replacing it with a `\\u2022` escape
    - "Decouvrir" now navigates instead of `preventDefault()`
  - `soulIntoArtProject/src/pages/ArtistProfile.jsx`:
    - replaced literal `\\u2022` rendering with real bullets via `{\"\\u2022\"}` in JSX
  - Added public artist profile page:
    - `soulIntoArtProject/src/pages/ArtistProfile.jsx`
    - `soulIntoArtProject/src/pages/ArtistProfile.css`
    - route added in `soulIntoArtProject/src/App.jsx`: `/tous-les-artistes/:slug`

### Validation
- `cd soulIntoArtProject && npm run lint` -> PASS
- `cd soulIntoArtProject && npm run build` -> PASS

### Notes
- Current git status includes untracked reference folder from user: `pdf SIA/`.

### Work completed (continued)
- Added canonical route baseline with compatibility redirects in:
  - `soulIntoArtProject/src/App.jsx`
- Added teacher route wiring using existing pages:
  - `/dashboard/teacher`
  - `/dashboard/teacher/courses`
  - `/dashboard/teacher/courses/new`
- Updated navigation links to canonical paths:
  - `cours` -> `/tous-les-cours-en-ligne`
  - `mes cours` -> `/dashboard/my-courses`
  - `connexion` -> `/dashboard`
  - `inscription` -> `/rejoindre-communaute-sia`
- Updated route usage across existing pages:
  - `Home.jsx`
  - `MyCourses.jsx`
  - `Login.jsx`
  - `Signup.jsx`
  - `ArtCourses.jsx`
  - `CourseDetail.jsx`
  - `TeacherCourses.jsx`
  - `CreateCourse.jsx`
  - `heroSlides.js`
- Updated course card URL generation:
  - `CourseCard.jsx` now builds canonical course links:
    - `/tous-les-cours/:discipline/:slug`

### Validation run (after routing updates)
- `cd soulIntoArtProject && npm run lint` -> PASS
- `cd soulIntoArtProject && npm run build` -> PASS

### Cross-platform consistency
- Normalized login import casing to match tracked file names:
  - `App.jsx` -> `./pages/login`
  - `pages/login.jsx` -> `./login.css`
- Re-validated:
  - `cd soulIntoArtProject && npm run lint` -> PASS
  - `cd soulIntoArtProject && npm run build` -> PASS

### Route coverage expansion
- Added reusable placeholder page:
  - `soulIntoArtProject/src/pages/PlaceholderPage.jsx`
- Extended route map with initial non-404 coverage for locked scope:
  - public placeholders: artists, subscriptions, share-art, faq, about, blog
  - legal placeholders: cgv/cgu, cookies, privacy, mentions
  - onboarding routes: `student-registration`, `instructor-registration`
  - dashboard route aliases for captured modules (announcements, analytics, settings, withdraw, zoom) routed temporarily to existing teacher view
- Enhanced signup flexibility:
  - `Signup.jsx` now accepts `initialRole` prop for role-specific registration routes

### Validation run (after placeholder expansion)
- `cd soulIntoArtProject && npm run lint` -> PASS
- `cd soulIntoArtProject && npm run build` -> PASS

### Public pages implemented from captured references
- Replaced public placeholders with real page components:
  - `soulIntoArtProject/src/pages/OffreAbonnements.jsx`
  - `soulIntoArtProject/src/pages/PartagerVotreArt.jsx`
  - `soulIntoArtProject/src/pages/FaqContact.jsx`
  - `soulIntoArtProject/src/pages/AProposPlateforme.jsx`
  - `soulIntoArtProject/src/pages/Blog.jsx`
  - `soulIntoArtProject/src/pages/BlogArticle.jsx`
  - `soulIntoArtProject/src/pages/GuidePrixArtistes.jsx`
  - `soulIntoArtProject/src/pages/MesRevenusArtiste.jsx`
  - `soulIntoArtProject/src/pages/LegalPage.jsx`
- Expanded shared public styles for cards/articles/tables/actions:
  - `soulIntoArtProject/src/pages/PublicPage.css`
- Added legal page content source:
  - `soulIntoArtProject/src/data/siteContent.js` (`legalContent`)

### Routing updates completed
- Updated `soulIntoArtProject/src/App.jsx`:
  - onboarding flow:
    - `/rejoindre-communaute-sia` -> `RejoindreCommunaute`
    - `/student-registration` -> `Signup initialRole="student"`
    - `/instructor-registration` -> `Signup initialRole="teacher"`
  - public content now wired to real pages:
    - `/tous-les-artistes`
    - `/offre-abonnements`
    - `/partager-votre-art`
    - `/faq-contact`
    - `/a-propos-plateforme-sia`
    - `/blog`
    - `/blog/:category/:slug`
    - `/guide-prix-artistes`
    - `/mes-revenus-artiste`
  - legal routes now wired to `LegalPage` with content props:
    - `/cgv-cgu`
    - `/politique-de-cookies`
    - `/politique-de-donnees-et-de-confidentialite`
    - `/mentions-legales`
  - compatibility redirects added:
    - `/abonnements` -> `/offre-abonnements`
    - `/partager-votre-art/cours-en-ligne-guides` -> `/guide-prix-artistes`
    - `/dashboard/create-course` -> `/dashboard/teacher/courses/new`

### Content cleanup
- Normalized apostrophes in new files to avoid rendering literal HTML entities.

### Validation run (after public page implementation)
- `cd soulIntoArtProject && npm run lint` -> PASS
- `cd soulIntoArtProject && npm run build` -> PASS

### Next actions
1. Build dedicated dashboard module pages for:
   - announcements, analytics, settings, withdraw, zoom.
2. Replace temporary dashboard aliases currently pointing to `TeacherCourses`.
3. Add API support for dashboard module data where needed.

### Dashboard modules implementation
- Added reusable teacher dashboard shell:
  - `soulIntoArtProject/src/components/TeacherDashboardShell.jsx`
  - `soulIntoArtProject/src/components/TeacherDashboardShell.css`
- Added dedicated dashboard pages:
  - `soulIntoArtProject/src/pages/DashboardAnnouncements.jsx`
  - `soulIntoArtProject/src/pages/DashboardAnalytics.jsx`
  - `soulIntoArtProject/src/pages/DashboardSettings.jsx`
  - `soulIntoArtProject/src/pages/DashboardWithdraw.jsx`
  - `soulIntoArtProject/src/pages/DashboardZoom.jsx`
- Refactored existing teacher pages into dashboard shell:
  - `soulIntoArtProject/src/pages/TeacherCourses.jsx`
  - `soulIntoArtProject/src/pages/CreateCourse.jsx`
- Updated routing in `soulIntoArtProject/src/App.jsx`:
  - `/dashboard/announcements` -> `DashboardAnnouncements`
  - `/dashboard/analytics` -> `DashboardAnalytics`
  - `/dashboard/settings` and child settings routes -> `DashboardSettings`
  - `/dashboard/withdraw` -> `DashboardWithdraw`
  - `/dashboard/zoom` -> `DashboardZoom`

### Validation run (after dashboard modules)
- `cd soulIntoArtProject && npm run lint` -> PASS
- `cd soulIntoArtProject && npm run build` -> PASS

### Remaining next actions
1. Add backend endpoints/tables for dashboard modules currently demo-data only:
   - announcements, withdraw requests, zoom config, advanced analytics.
2. Normalize remaining text encoding artifacts in older files (`Ã`, `â` sequences).
3. Run UI parity pass against each captured HTML page for spacing/labels/details.

### Access fixes (teacher visibility)
- Problem observed:
  - Teacher routes existed but were not clearly reachable from navigation.
  - Login/signup redirected all roles to public courses.
- Fixes applied:
  - `soulIntoArtProject/src/App.jsx`
    - Added teacher-only nav entry: `Espace prof` (`/dashboard/teacher/courses`) on desktop and mobile.
    - Added teacher-only dropdown item: `Dashboard prof`.
  - `soulIntoArtProject/src/pages/login.jsx`
    - Role-based redirect after login:
      - teacher -> `/dashboard/teacher/courses`
      - student -> `/tous-les-cours-en-ligne`
  - `soulIntoArtProject/src/pages/Signup.jsx`
    - Role-based redirect after signup:
      - teacher -> `/dashboard/teacher/courses`
      - student -> `/tous-les-cours-en-ligne`

### Validation run (after access fixes)
- `cd soulIntoArtProject && npm run lint` -> PASS
- `cd soulIntoArtProject && npm run build` -> PASS

### UI rebuild requested by client review
- Rebuilt top navigation to match captured Soul Into Art header style:
  - logo image, desktop dropdown menus, cart/user icon actions, updated mobile drawer.
  - files:
    - `soulIntoArtProject/src/App.jsx`
    - `soulIntoArtProject/src/App.css`
- Reworked `/partager-votre-art` with structure inspired by live page:
  - hero + breadcrumb + reasons + steps + ecosystem + FAQ + final CTA.
  - files:
    - `soulIntoArtProject/src/pages/PartagerVotreArt.jsx`
    - `soulIntoArtProject/src/pages/ArtistPages.css`
- Reworked `/tous-les-artistes` to instructor card layout (cover + avatar + discipline tags + discover button):
  - added search + discipline filter controls.
  - files:
    - `soulIntoArtProject/src/pages/TousLesArtistes.jsx`
    - `soulIntoArtProject/src/pages/ArtistPages.css`
- Updated artist source data from live page extraction:
  - `soulIntoArtProject/src/data/siteContent.js`
  - now includes richer fields: `avatar`, `cover`, `disciplines`, `coursesSummary`, `countryFlag`, `profileUrl`.
- Added compatibility route:
  - `/cart` -> `/offre-abonnements` in `App.jsx`.

### Validation run (after nav + pages rebuild)
- `cd soulIntoArtProject && npm run lint` -> PASS
- `cd soulIntoArtProject && npm run build` -> PASS

### Home page enhancement (featured blue box)
- User feedback: homepage looked too empty.
- Added a large highlighted featured-course module on home to match requested visual direction:
  - blue/turquoise gradient box with subtle pattern
  - heading/badge block
  - large split card (image + course details + CTA)
  - decorative controls/dots to match the provided mockup vibe
- Updated files:
  - `soulIntoArtProject/src/pages/Home.jsx`
  - `soulIntoArtProject/src/pages/Home.css`

### Validation run (after home enhancement)
- `cd soulIntoArtProject && npm run lint` -> PASS
- `cd soulIntoArtProject && npm run build` -> PASS

### Dashboard shell unification (student + teacher)
- User request:
  - apply the same left dashboard experience for student and teacher.
  - remove the top navbar user dropdown.
  - keep direct account access from the user icon.
- Navigation updates:
  - removed desktop user dropdown from `soulIntoArtProject/src/App.jsx`.
  - user icon now links directly to `/dashboard/profile`.
  - mobile keeps explicit logout button.
- New dashboard pages added:
  - `soulIntoArtProject/src/pages/DashboardOverview.jsx`
  - `soulIntoArtProject/src/pages/DashboardProfile.jsx`
  - `soulIntoArtProject/src/pages/DashboardPlaceholder.jsx`
- Dashboard routing expanded in `soulIntoArtProject/src/App.jsx`:
  - `/dashboard/overview`
  - `/dashboard/profile`
  - `/dashboard/reviews`
  - `/dashboard/quiz-attempts`
  - `/dashboard/wishlist`
  - `/dashboard/orders`
  - `/dashboard/questions-answers`
  - `/dashboard/calendar`
- Shared shell refactor:
  - rebuilt `soulIntoArtProject/src/components/TeacherDashboardShell.jsx` + `.css`
  - sidebar now supports both roles, role-specific links, visual profile block, and in-sidebar logout.
- Student dashboard integration:
  - migrated `soulIntoArtProject/src/pages/MyCourses.jsx` to the shared shell layout.
- Auth flow tweak:
  - login/signup now redirect to `/dashboard/overview`:
    - `soulIntoArtProject/src/pages/Login.jsx`
    - `soulIntoArtProject/src/pages/Signup.jsx`

### Validation run (after dashboard unification)
- `cd soulIntoArtProject && npm run lint` -> PASS
- `cd soulIntoArtProject && npm run build` -> PASS

### UI polish (join cards CTA alignment)
- User request:
  - align "Creer mon compte apprenant" and "Creer mon compte artiste" buttons at the same vertical level.
- Changes:
  - removed inline `marginTop` from `soulIntoArtProject/src/pages/RejoindreCommunaute.jsx`.
  - added dedicated classes for CTA container:
    - `public-join-card`
    - `public-join-card-cta`
  - updated `soulIntoArtProject/src/pages/PublicPage.css`:
    - card body switched to column flex for this section only
    - CTA container now uses `margin-top: auto` for bottom alignment
- Validation:
  - `cd soulIntoArtProject && npm run lint` -> PASS

## 2026-02-09 - Session DB-first migration (Supabase-ready)

### Objective
- Implement the full migration of hardcoded editorial/business data to Postgres.
- Link announcements and blog content to real teacher accounts in DB.
- Keep current JWT auth/API architecture.

### Backend changes completed
- Added env/config support for managed Postgres:
  - `api/src/config/env.js`: `DATABASE_SSL`, `AUTO_SEED`.
  - `api/src/config/db.js`: SSL pool config.
  - `api/src/server.js`: seed execution now controlled by `AUTO_SEED`.
  - `api/.env.example` updated with Supabase pooler example.
- Added migrations:
  - `api/src/db/migrations/006_teacher_profiles.sql`
  - `api/src/db/migrations/007_blog.sql`
  - `api/src/db/migrations/008_announcements.sql`
  - `api/src/db/migrations/009_site_content.sql`
- Fixed migration safety:
  - `api/src/db/migrations/002_unique_artists.sql` guarded when `artists` table does not exist.
- Added models/services/controllers/routes for DB-first modules:
  - Teachers:
    - `api/src/models/teacherProfileModel.js`
    - `api/src/services/teacherProfileService.js`
    - `api/src/controllers/teacherController.js`
    - `api/src/routes/teachers.js`
  - Blog:
    - `api/src/models/blogModel.js`
    - `api/src/services/blogService.js`
    - `api/src/controllers/blogController.js`
    - `api/src/routes/blog.js`
  - Announcements:
    - `api/src/models/announcementModel.js`
    - `api/src/services/announcementService.js`
    - `api/src/controllers/announcementController.js`
    - `api/src/routes/announcements.js`
  - Site content:
    - `api/src/models/siteContentModel.js`
    - `api/src/services/contentService.js`
    - `api/src/controllers/contentController.js`
    - `api/src/routes/content.js`
- Route wiring updated:
  - `api/src/routes/index.js`
- Role middleware extended:
  - `api/src/middleware/auth.js` with `requireRole` and `requireTeacher`.
- Course route protection normalized:
  - `api/src/routes/courses.js`.
- Teacher signup now creates profile record:
  - `api/src/services/authService.js`.
- Added DB-first seed:
  - `api/src/db/seeds/003_content_seed.sql` (teacher profiles, blog, announcements, site content keys).

### Frontend changes completed
- API client expanded:
  - `soulIntoArtProject/src/api/client.js`
  - new methods for teachers/blog/announcements/content.
- Added content hook:
  - `soulIntoArtProject/src/hooks/useSiteContent.js`.
- Pages switched from hardcoded data to API/DB:
  - `soulIntoArtProject/src/pages/Home.jsx`
  - `soulIntoArtProject/src/pages/Blog.jsx`
  - `soulIntoArtProject/src/pages/BlogArticle.jsx`
  - `soulIntoArtProject/src/pages/TousLesArtistes.jsx`
  - `soulIntoArtProject/src/pages/DashboardAnnouncements.jsx`
  - `soulIntoArtProject/src/pages/DashboardProfile.jsx`
  - `soulIntoArtProject/src/pages/AProposPlateforme.jsx`
  - `soulIntoArtProject/src/pages/OffreAbonnements.jsx`
  - `soulIntoArtProject/src/pages/FaqContact.jsx`
  - `soulIntoArtProject/src/pages/PartagerVotreArt.jsx`
  - `soulIntoArtProject/src/pages/GuidePrixArtistes.jsx`
  - `soulIntoArtProject/src/pages/MesRevenusArtiste.jsx`
  - `soulIntoArtProject/src/pages/LegalPage.jsx`
  - `soulIntoArtProject/src/App.jsx` (legal pages now use content keys).
  - `soulIntoArtProject/src/pages/DashboardAnnouncements.jsx` supports:
    - teacher mode: create + own history (`/announcements/my`)
    - student mode: read-only feed from followed teachers (`/announcements/feed`)

### Documentation updates
- Rewrote setup and ops guide:
  - `README.txt`
- Rewrote project contract with DB-first rules/content keys:
  - `codex.md`

### Validation executed
- Backend:
  - `cd api && npm run db:migrate` -> PASS
  - `cd api && npm run db:migrate` (2nd run, idempotence check) -> PASS
  - `cd api && npm run db:seed` -> PASS
  - `cd api && npm run db:seed` (2nd run, controlled seed history) -> PASS
  - Server boot smoke check -> PASS
  - API smoke checks -> PASS:
    - public teachers
    - blog list + detail
    - content batch endpoint + missing key returns `null`
    - teacher profile endpoint
    - announcement create/list
    - student feed filtered by followed teachers
    - ownership guard for `audience='course'`
    - blog create forbidden for student role
- Frontend:
  - `cd soulIntoArtProject && npm run lint` -> PASS
  - `cd soulIntoArtProject && npm run build` -> PASS

### Notes
- `.gitignore` already contains `/pdf SIA/` to keep reference captures out of git.
- Current content editing workflow remains Supabase Table Editor (no CMS UI in this phase).

### Next steps
1. Populate final real teacher profiles/content with client-approved text and images in Supabase.
2. Add optional admin approval flow for teacher signup (future phase).
3. Add automated API integration tests for new endpoints.

## 2026-02-09 - Supabase connectivity fix (IPv6 vs pooler)

### Issue
- Direct DB host `db.<project_ref>.supabase.co` resolved to IPv6 only on the local network.
- This caused `getaddrinfo ENOTFOUND` in Node/pg on some setups.
- Supabase Free plan does not include dedicated IPv4 for direct DB connections.

### Fix
- Use Supabase Shared Pooler host (`aws-*-*.pooler.supabase.com`) instead of the direct `db.*` host.
- Keep TLS enabled via `DATABASE_SSL=true` and pg ssl config (`rejectUnauthorized=false`).
- Removed `?sslmode=require` from `DATABASE_URL` to avoid `SELF_SIGNED_CERT_IN_CHAIN` with Node TLS on this setup.

### Debug improvements
- `api/src/config/env.js` now loads dotenv with `override` in non-production, to avoid stale terminal env vars overriding `.env`.
- `api/src/server.js` logs the DB host/db name (redacted) in non-production to confirm which database is used.

## 2026-02-09 - Course Reviews (Avis) + Fix "Continuer le cours"

### Goal
- Allow enrolled students to create/update a course review (stars 1-5 + optional comment).
- Show average rating + review count on course cards and course detail page.
- Show teacher's overall rating average on the dashboard sidebar.
- Fix "Continuer le cours" button in `/dashboard/my-courses` (was not navigating).

### Backend changes
- Added migration:
  - `api/src/db/migrations/010_course_reviews.sql` (`course_reviews` table + constraints + indexes)
- Added optional seed:
  - `api/src/db/seeds/004_reviews_seed.sql` (demo reviews by email/slug)
- Added review module (model/service/controller/routes):
  - `api/src/models/reviewModel.js`
  - `api/src/services/reviewService.js`
  - `api/src/controllers/reviewController.js`
  - `api/src/routes/reviews.js`
  - mounted in `api/src/routes/index.js` under `/reviews`
- Added `forbidden()` helper:
  - `api/src/utils/httpError.js`
- Injected rating summary into course data:
  - `api/src/models/courseModel.js` (LEFT JOIN aggregated reviews)
  - `api/src/services/courseService.js` (adds `rating_avg`, `reviews_count`)
  - `api/src/models/enrollmentModel.js` (my courses now returns full course + summary)
  - `api/src/services/enrollmentService.js` (maps to consistent API shape)
- Teacher overall rating summary added to profile response:
  - `api/src/services/teacherProfileService.js` now includes `rating_avg`, `reviews_count`

### Frontend changes
- API client additions:
  - `soulIntoArtProject/src/api/client.js`:
    - `getMyCourseReview(courseId)`
    - `upsertMyCourseReview(courseId, payload)`
- Fix "Continuer le cours" navigation:
  - `soulIntoArtProject/src/components/CourseCard.jsx` now links to the course page
  - `soulIntoArtProject/src/components/CourseCard.css` adds `.course-card-continue-link`
- Show real rating summary on course cards:
  - `soulIntoArtProject/src/components/CourseCard.jsx` uses `rating_avg` + `reviews_count`
- Course detail review box:
  - `soulIntoArtProject/src/pages/CourseDetail.jsx` added "Votre avis" section for enrolled users
  - `soulIntoArtProject/src/pages/CourseDetail.css` styles for review UI and rating summary
- Teacher dashboard sidebar rating:
  - `soulIntoArtProject/src/components/TeacherDashboardShell.jsx` fetches teacher profile and displays average + stars
  - `soulIntoArtProject/src/components/TeacherDashboardShell.css` adds `.dashboard-profile-rating`

### Validation
- `cd api && npm run db:migrate` -> PASS (applied `010_course_reviews.sql`)
- `cd api && npm run db:seed` -> PASS (applied `004_reviews_seed.sql`)
- API smoke checks (manual script):
  - enrolled student can upsert review and summary updates
  - non-enrolled student gets `403 not_enrolled`
  - teacher profile returns rating summary
- `cd soulIntoArtProject && npm run lint` -> PASS
- `cd soulIntoArtProject && npm run build` -> PASS
