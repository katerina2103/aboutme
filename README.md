# Katya's professional website

Plain HTML, CSS and JavaScript. No framework, third-party runtime scripts, or npm dependencies. Node 22+ is used only for building and checking.

## Build

Run `npm run build`. The output is in `dist/`. To preview, serve that folder with any static web server.

## GitHub Pages setup

1. Create or choose a GitHub repository with default branch `main`.
2. Commit this folder's contents at the repository root, including `.github/workflows/pages.yml`.
3. In the repository, open Settings → Pages → Build and deployment → Source and choose GitHub Actions.
4. Push to `main` or run “Build and deploy website” in Actions. The deployment job provides the live URL.

Pull requests run the build and checks but do not publish. Main-branch pushes publish automatically. Relative asset paths support both a project repository URL and an account-level website.

## Edit without prompts

For now, use GitHub's file editor: `src/index.html` contains page text and links, `src/app.js` contains case studies and interactive section content, and `src/styles.css` contains styling. Commit an edit to trigger deployment. Upload images, the CV and other assets to `src/assets/` and use relative paths such as `./assets/cv.pdf`. Assets are copied during the build.

This package does not yet include the visual editor discussed in chat. A static GitHub Pages site cannot privately save changes to GitHub by itself. A visual editor can later export changed files for you to commit, or use a CMS with authenticated repository access. Do not put a repository write token into the public site.

## Content status

The video, CV, testimonials and vision/strategy/roadmap/prototype sections remain placeholders. The video picker is a local-only preview, not an upload. Company names have been removed; case details remain subject to Katya's review. Publishing this site makes its content and email link accessible to visitors.
