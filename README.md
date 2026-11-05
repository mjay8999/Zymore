# Zymore Website

Modular Next.js + TypeScript website for Zymore (AI automation and workflow development for B2B brands and businesses).

## Stack
- Next.js App Router
- React + TypeScript
- Reusable component architecture
- Security headers via `next.config.ts`

## Brand Details
- Domain: https://zymore.tech
- Support email: support@zymore.tech

## Routes
- `/` - Homepage
- `/about` - Company story and founder introduction
- `/founder` - Founder story
- `/contact` - Project enquiry form
- `/blog` - Blog overview with categories and image-first article gallery
- `/blog/category/[category]` - Separate pages for each blog category
- `/blog/[slug]` - Dynamic blog article pages with related-link tree
- `/control-panel-zymore` - Protected article manager

## Run Locally
1. Install dependencies:
	`npm install`
2. Start development:
	`npm run dev`
3. Production build check:
	`npm run build`

## Contact Form Email Delivery
The contact form sends submissions to `CONTACT_TO_EMAIL` using Resend. Configure `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `CONTACT_TO_EMAIL` in your local `.env` and deployment environment. The sender domain must be verified with Resend. Without these values, local development saves enquiries to the ignored `data/contact-inquiries.json` file; production requires email configuration.

## Vercel Setup
1. Import this repository into Vercel and connect the production domain.
2. In the Vercel project, open **Storage → Create Storage → Blob**, create a **Public** Blob store, and connect it to Production, Preview, and Development. The site uses it for article data and public article images.
3. Pull the generated Blob environment variables for local work with `vercel env pull .env` (or add the generated `BLOB_READ_WRITE_TOKEN` to your local `.env`).
4. Set `ZYMORE_ADMIN_KEY` to a unique random secret (at least 32 characters) in Vercel's Production environment. Add the Resend variables above to Production too.
5. Redeploy. Sign in at `/admin-access`; the article editor can then upload cover and inline images and save article changes persistently.

The existing `data/posts.json` is the seed content. When a connected Blob store has no saved content yet, the site reads this seed; the first admin save writes the live content to Blob. Do not delete the Blob store or its `content/posts.json` object if you want to retain admin edits. `public/` assets such as the site logos remain part of the deployment, so changing those still requires a new deployment.

## Content Updates
- Founder content: update `app/founder/page.tsx`.
- Category definitions: update `lib/blog-categories.ts`.
- Blog seed content: `data/posts.json`; live admin changes are stored in Vercel Blob after the store is connected.


## Blog Categories Implemented
- AI Safety
- Cybersecurity
- AI In Healthcare
- Effects Of AI On Human Body

## Visual Direction
The UI is designed with an Apple/Anthropic-inspired premium minimal feel while preserving your sage, grey, burgundy, and cream brand palette.

