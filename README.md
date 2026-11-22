# Warm Media

Warm Media is a bilingual Arabic/English news and community frontend backed by Supabase Auth, PostgreSQL, Row Level Security, Storage and Realtime.

## Frontend structure
The complete frontend is intentionally kept in exactly three files:
- `index.html`
- `style.css`
- `script.js`

Backend/database support files are separate by design. The frontend uses the Supabase browser client and only the public anon key. **Never place the service-role key in browser code.**

## Requirements
- Node.js 18+ (for local static server and the one-time admin bootstrap script)
- A Supabase project
- A modern browser

## 1. Create the Supabase project
Create a project at https://supabase.com. In Project Settings → API, copy the Project URL and anon/public key.

## 2. Create the database
Open Supabase → SQL Editor and run, in order:
1. `database/schema.sql`
2. `database/platform-extension.sql`
3. Create a Storage bucket named `warm-media-public` (public read).
4. Run `database/storage-policies.sql`.

The schema enables RLS on application tables, adds role/permission helpers, profile creation on signup, and adds chat messages to the `supabase_realtime` publication. Check the Supabase Realtime dashboard if the publication is not active.

## 3. Configure the browser
Open the first lines of `script.js` and fill:
```js
const CONFIG={
  SUPABASE_URL:"https://YOUR_PROJECT.supabase.co",
  SUPABASE_ANON_KEY:"YOUR_SUPABASE_ANON_KEY",
  DEFAULT_AVATAR_A:"https://.../avatar-a.png",
  DEFAULT_AVATAR_B:"https://.../avatar-b.png"
};
```
The anon key is designed for public clients; RLS is the security boundary. Never use a service-role key here. The `.env.example` file is a reference for deployment and admin bootstrap; static hosting does not automatically inject `.env` into JavaScript.

## 4. Run locally
```bash
npm install
npm run serve
```
Open http://localhost:4173. Alternatively use the VS Code Live Server extension.

## 5. Create the first Super Admin
1. Sign up normally through the app and confirm the email if email confirmation is enabled.
2. From a trusted terminal, set environment variables (do not commit them):
```bash
export SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
npm run bootstrap:admin
```
3. Enter the exact email of the existing account. The script grants the `super_admin` role. Remove the service-role variable from your shell afterward.
4. The browser session may need a refresh before the Admin navigation appears.

This bootstrap script uses the Supabase service-role key only from a trusted local process. Do not run it in the browser or publish the key.

## 6. Deploy
Upload the project root to any static host (Netlify, Vercel static, Cloudflare Pages, GitHub Pages). Configure the host to serve `index.html` as the entry point. Set the Supabase URL/anon key in `script.js` before deployment. Configure HTTPS and your production allowed redirect URLs in Supabase Auth → URL Configuration.

## Features in this delivery
- Signup/login/logout with Supabase Auth
- Profile display-name/avatar editing
- News listing, search, category filtering, article view counter, comments
- Public chat room with database persistence and Realtime insert subscription
- Staff news publishing/editing and basic report review UI
- RBAC roles and permission helpers enforced by PostgreSQL RLS
- Admin statistics, Arabic/English UI toggle, RTL/LTR, theme toggle, responsive layout
- Category rail, reactions, bookmarks, ads, reward-badge hooks, posts, and notification preference SQL

## Important production hardening notes
This is a functional integration starter, not a claim of a completed third-party deployment or external penetration test. Before opening registration to the public:
- Configure SMTP/custom email templates and auth rate limits in Supabase.
- Add CAPTCHA / bot protection and stricter anti-spam throttling (for example an Edge Function with per-user/IP limits).
- Add server-side audit triggers for every privileged mutation; do not rely only on frontend logging.
- Add moderation workflows for account bans, report targets, comment likes/replies UI, notification delivery, and presence.
- Use Supabase Storage uploads rather than accepting arbitrary image URLs if you need managed uploads.
- Add legal-reviewed Terms and Privacy pages and a content policy/contact channel.
- Review and test RLS policies with separate member/moderator/admin accounts before production.
- Configure backup/PITR and monitor database/auth logs.

## Original logo and avatars
No existing project files were attached to this build request, so the original logo could not be inspected or preserved in this generated package. The UI currently uses a text-based W mark. Replace that mark with your existing logo asset once you place it in the project, and set the two avatar URLs in `script.js`.
