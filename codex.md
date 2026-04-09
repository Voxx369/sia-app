# Soul Into Art Rebuild Contract (DB-first)

## 1) Goal
- Rebuild Soul Into Art without WordPress.
- Keep strong visual parity with the reference site.
- Centralize business/content data in Postgres (Supabase-hosted).

## 2) Locked Technical Direction
- Frontend: React + Vite.
- Backend: Express API + JWT auth.
- Database: Postgres on Supabase (no Supabase Auth migration in this phase).
- Language: French-first.
- Payments: informational only in this phase.

## 3) Data Ownership Rules
- Database is the single source of truth for:
  - teacher public profiles
  - blog posts/categories
  - announcements
  - editorial public content blocks
- Frontend must not rely on `src/data/*` for editorial content.
- UI chrome labels (buttons/nav/system labels) can stay in code.

## 4) Core Business Rules
- Public artists list = only users with `role='teacher'` and `teacher_profiles.is_public=true`.
- Blog post author must be a teacher account.
- Student announcements feed is derived from followed teachers via enrollments:
  - `enrollments -> courses.teacher_id`.
- Announcement with `audience='course'` is valid only if course belongs to author teacher.

## 5) Canonical Content Keys (`site_content_entries.key`)

- `home.hero_slides`
- `home.testimonials`
- `home.faqs`
- `public.subscription_plans`
- `public.contact_faqs`
- `public.contact_methods`
- `public.about_values`
- `public.share.reasons`
- `public.share.steps`
- `public.share.features`
- `public.share.faq`
- `public.guide.minimum_price_rules`
- `public.guide.checklist`
- `public.guide.faq`
- `public.revenue.monthly_rows`
- `public.revenue.tips`
- `legal.cgv_cgu`
- `legal.cookies`
- `legal.privacy`
- `legal.legal_notice`

## 6) API Contract Additions

- `GET /teachers/public`
- `GET /teachers/me/profile`
- `PUT /teachers/me/profile`
- `GET /blog/posts`
- `GET /blog/posts/:slug`
- `POST /blog/posts`
- `PATCH /blog/posts/:id`
- `GET /announcements/feed`
- `GET /announcements/my`
- `POST /announcements`
- `GET /content?keys=...`

## 7) Delivery Hygiene
- Keep `WORKLOG.md` updated every session with:
  - what changed
  - why
  - files touched
  - validations run
  - next steps
- Before major merges:
  - frontend `npm run lint` and `npm run build`
  - backend `npm run db:migrate` and `npm run db:seed`
  - smoke test key endpoints (auth, teachers, blog, announcements, content)
