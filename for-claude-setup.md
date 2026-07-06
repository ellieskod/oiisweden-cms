# OII Sweden CMS (Astro + Sveltia)
follow this specification when asked to set up the project. 

Separate Astro + Sveltia CMS project for managing content in the main OII Sweden frontend.

## Project Context

**Main Frontend Project:**

- Repo: https://github.com/ellieskod/oiisweden
- Stack: React + Vite
- URL: https://oiisweden.pages.dev
- Content Format: JSON files in `public/data/pages/`

**This CMS Project:**

- Repo: https://github.com/ellieskod/oiisweden-cms
- Stack: Astro + Sveltia CMS
- URL: https://oiisweden-cms.pages.dev/admin/
- Platform: Cloudflare Pages (separate project)

**Content Management:**

- Content stored in: Main repo (`ellieskod/oiisweden`) at `src/content/pages/`
- i18n structure: Separate files (sv/ and en/ folders)
- Sveltia commits directly to main repo
- Frontend automatically picks up changes
- each page has a json file and a template

**Authentication:**

- GitHub OAuth via Sveltia CMS
- Main repo access token required

---

## Setup Instructions

### 1. Create New GitHub Repo

1. Create repo: `oiisweden-cms` on GitHub (ellieskod account)
2. Clone locally:

```bash
git clone https://github.com/ellieskod/oiisweden-cms
cd oiisweden-cms
```

### 2. Create Project Structure

```bash
mkdir -p public/admin
mkdir -p src/content
mkdir -p src/pages
touch .gitignore
```

### 3. Create Root Files

**package.json:**

```json
{
  "name": "oiisweden-cms",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^4.15.0"
  }
}
```

**astro.config.mjs:**

```javascript
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
});
```

**.gitignore:**

```
node_modules/
dist/
.env
.env.local
```

### 4. Create Sveltia CMS Files

**public/admin/index.html:**

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>OII Sweden - Content Management</title>
    <script src="https://cdn.jsdelivr.net/npm/@sveltia/cms@latest/dist/sveltia-cms.js"></script>
  </head>
  <body></body>
</html>
```

**public/admin/config.yml:**

```yaml
backend:
  name: github
  repo: ellieskod/oiisweden
  branch: main

i18n:
  structure: separate_files
  locales: [sv, en]
  default_locale: sv

media_folder: public/uploads
public_path: /uploads

collections:
  - name: pages
    label: Pages
    folder: src/content/pages
    slug: "{{fields.slug}}"
    create: true
    i18n: true
    format: json
    fields:
      - name: template
        label: Template
        widget: hidden
        default: pages
        i18n: false
      - name: title
        label: Title
        widget: string
        i18n: true
      - name: slug
        label: Slug
        widget: string
        i18n: false
      - name: description
        label: Meta Description
        widget: text
        i18n: true
      - name: hero
        label: Hero Section
        widget: object
        i18n: true
        fields:
          - name: headline
            label: Headline
            widget: string
            i18n: true
          - name: description
            label: Description
            widget: text
            i18n: true
      - name: sections
        label: Sections
        widget: list
        i18n: true
        types:
          - label: Cards
            name: cards
            widget: object
            fields:
              - name: type
                label: Type
                widget: hidden
                default: cards
              - name: description
                label: Description
                widget: text
              - name: cards
                label: Cards
                widget: list
                fields:
                  - name: title
                    label: Title
                    widget: string
                  - name: description
                    label: Description
                    widget: text
                  - name: icon
                    label: Icon
                    widget: string
                  - name: page
                    label: Link to Page
                    widget: string
                    required: false
                  - name: link
                    label: External Link
                    widget: string
                    required: false
          - label: Text
            name: text
            widget: object
            fields:
              - name: type
                label: Type
                widget: hidden
                default: text
              - name: content
                label: Content
                widget: markdown
```

### 5. Create Astro Content Configuration

**src/content/config.ts:**

```typescript
import { defineCollection, z } from "astro:content";

const pagesCollection = defineCollection({
  type: "data",
  schema: z.object({
    template: z.literal("pages"),
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    hero: z.object({
      headline: z.string(),
      description: z.string(),
    }),
    sections: z.array(z.any()),
  }),
});

export const collections = {
  pages: pagesCollection,
};
```

**src/pages/admin/index.astro:**

```astro
---
const redirect = Astro.redirect("../admin/index.html");
---
```

### 6. Install & Test Locally

```bash
npm install
npm run dev
```

Visit: http://localhost:3000/admin/

### 7. Deploy to Cloudflare Pages

1. Add new project in Cloudflare Pages pointing to `https://github.com/ellieskod/oiisweden-cms`
2. Configure build:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. Set environment variables (if needed for OAuth):
   - `GITHUB_CLIENT_ID`: (GitHub OAuth app Client ID)
   - `GITHUB_CLIENT_SECRET`: (GitHub OAuth app Client Secret)
4. Deploy

CMS will be available at: https://oiisweden-cms.pages.dev/admin/

---

## How It Works

1. Dev visits https://oiisweden-cms.pages.dev/admin/
2. Clicks "Sign In with GitHub"
3. Sveltia authenticates and loads content from `oiisweden/oiisweden` repo
4. Edits content (pages, cards, text sections)
5. Sveltia commits changes to main repo
6. Frontend (https://oiisweden.pages.dev) fetches from `public/data/pages/` and displays updated content

---

## Content Structure

Content is stored in the main repo (`oiisweden/oiisweden`) at:

```
src/content/pages/
├── sv/
│   ├── home.json
│   ├── about-us.json
│   └── [page-name].json
└── en/
    ├── home.json
    ├── about-us.json
    └── [page-name].json
```

Each file follows this schema:

```json
{
  "template": "pages",
  "title": "Page Title",
  "slug": "page-name",
  "description": "Meta description",
  "hero": {
    "headline": "Hero headline",
    "description": "Hero description"
  },
  "sections": [
    {
      "type": "cards",
      "description": "Card section description",
      "cards": [
        {
          "title": "Card title",
          "description": "Card description",
          "icon": "🎯",
          "page": "linked-page-name",
          "link": "https://external-url.com"
        }
      ]
    }
  ]
}
```

---

## Troubleshooting

**"Not Found" error on login**

- Check GitHub OAuth app credentials
- Verify `repo: ellieskod/oiisweden` in config.yml
- Ensure Cloudflare env vars are set

**Content not appearing in Sveltia**

- Verify `folder: src/content/pages` path in config
- Check main repo has `src/content/pages/` directory
- Clear browser cache and refresh

**Deploy issues**

- Ensure `npm install` succeeds
- Check Cloudflare Pages build logs
- Verify no `node_modules` committed (in `.gitignore`)
