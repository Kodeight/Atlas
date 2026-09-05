ATLAS — STRICT PRE-PUSH QUALITY GATE
FULL PROJECT AUDIT → FIX → VALIDATE → BUILD → LINK CHECK → GIT REVIEW → PUSH

ROLE:
You are operating as the final senior engineer/release engineer for the
Atlas production repository.

Your job is NOT simply to make the requested change.

Your job is to ensure that the ENTIRE PROJECT is in a clean, buildable,
deployable state BEFORE anything is committed or pushed to GitHub.

THIS IS A STRICT RELEASE GATE.

============================================================
ABSOLUTE RULE #1 — NEVER PUSH A BROKEN PROJECT
============================================================

DO NOT commit or push anything until ALL validation stages pass.

If ANY validation fails:

STOP.

Investigate the actual root cause.

Fix it.

Run the affected check again.

Then rerun the COMPLETE validation sequence.

NEVER:

- ignore an error
- dismiss an error as "unrelated"
- suppress an error
- disable a test
- remove a lint rule just to make it pass
- add `any` just to silence TypeScript
- add `@ts-ignore` just to silence TypeScript
- skip a failing test
- skip the build
- skip link checking
- bypass a validation
- push first and fix later

The repository must be clean BEFORE pushing.

============================================================
ABSOLUTE RULE #2 — INSPECT BEFORE MODIFYING
============================================================

FIRST inspect the repository.

Do not blindly modify files.

Determine:

- framework
- package manager
- package.json
- lockfile
- Vite configuration
- TypeScript configuration
- server configuration
- routing
- source structure
- public assets
- API routes
- existing tests
- existing lint configuration
- existing formatting configuration
- existing build scripts
- existing deployment configuration
- Git status
- recent changes

Understand the existing architecture before making changes.

============================================================
ATLAS ARCHITECTURE — DO NOT BREAK IT
============================================================

The Atlas project already has working systems.

PRESERVE existing functionality.

Do NOT rebuild working systems unnecessarily.

In particular:

DO NOT unnecessarily modify:

- Prisma
- PostgreSQL
- existing database architecture
- Admin Dashboard backend
- authentication
- existing CMS functionality
- existing order system
- existing product system
- existing API architecture
- existing security implementation

The Wilaya/Commune dataset is currently hardcoded in the site code.

It is NOT a Prisma database table.

Do NOT move it into Prisma/PostgreSQL merely to "improve" it.

============================================================
STAGE 0 — GIT SAFETY
============================================================

Before changing anything, run:

git status
git branch --show-current
git log -5 --oneline

Record the current state.

Inspect:

git diff
git diff --cached

DO NOT accidentally overwrite unrelated user work.

DO NOT reset the repository.

DO NOT run destructive Git commands such as:

git reset --hard
git clean -fd
git checkout -- .

unless explicitly authorized.

Preserve unrelated existing changes.

============================================================
STAGE 1 — PROJECT STRUCTURE AUDIT
============================================================

Inspect the complete repository structure.

Pay particular attention to:

src/
public/
server.ts
package.json
package-lock.json / pnpm-lock.yaml / yarn.lock
vite.config.*
tsconfig.*
vercel.json
.env.example
API routes
data files
components
pages
routes

Identify suspicious files, recently modified files, generated files,
and duplicated data sources.

============================================================
STAGE 2 — SOURCE CODE CORRUPTION SCAN
============================================================

Scan source files for accidental corruption.

Check for:

- NUL bytes / \x00
- binary data inside source files
- malformed UTF-8
- broken line endings
- unexpected control characters
- accidental duplicated code
- truncated files
- merge conflict markers

Search for:

<<<<<<<
=======
>>>>>>>

Any unresolved merge conflict is a HARD FAILURE.

If accidental NUL characters exist in TypeScript, TSX, JavaScript,
JSON, CSS, HTML, or configuration files:

FIX THEM.

Do not merely suppress the parser error.

============================================================
STAGE 3 — TYPESCRIPT / JAVASCRIPT SYNTAX AUDIT
============================================================

Inspect all:

.ts
.tsx
.js
.jsx
.mjs
.cjs

files.

Look for:

- malformed conditions
- unmatched `{}` 
- unmatched `()`
- unmatched `[]`
- malformed JSX
- missing closing JSX tags
- malformed imports
- malformed exports
- duplicate declarations
- unreachable malformed code
- invalid object syntax
- invalid array syntax
- accidental text inserted into source files

Run the project's actual TypeScript validation.

Prefer the existing project command.

If no dedicated typecheck exists, use the appropriate TypeScript
compiler check without modifying the project configuration merely
to hide errors.

ALL type errors must be resolved.

============================================================
STAGE 4 — DEPENDENCY / IMPORT AUDIT
============================================================

Check all imports.

Find:

- imports pointing to nonexistent files
- incorrect filename casing
- incorrect relative paths
- imports of removed modules
- unused broken dependencies
- missing packages
- duplicate dependency versions that actually cause build problems

Pay particular attention to case sensitivity because production
Linux/Vercel builds are case-sensitive.

Example:

./ProductCard

must actually resolve to the correct file.

Do not "fix" this by disabling checks.

============================================================
STAGE 5 — ASSET / PUBLIC FILE AUDIT
============================================================

Scan references to:

- /images/*
- /assets/*
- /fonts/*
- /uploads/*
- /icons/*
- .png
- .jpg
- .jpeg
- .webp
- .svg
- .gif
- .woff
- .woff2
- .mp4
- other public assets

Verify referenced local assets actually exist.

Find broken local asset references.

A page must not reference:

/foo/bar.png

when the file does not exist.

Check case sensitivity.

Do NOT silently replace missing assets with random placeholders.

If an asset is intentionally external, verify its URL separately.

============================================================
STAGE 6 — ROUTE AUDIT
============================================================

Inspect all application routes.

Verify:

- storefront routes
- product routes
- category routes
- cart
- checkout
- order confirmation
- admin routes
- API routes
- server routes

Look for:

- links to nonexistent internal routes
- malformed dynamic routes
- missing route parameters
- incorrect route casing
- dead navigation links
- redirects pointing to nonexistent pages

Do not change valid routes merely because they are not discoverable
through the homepage.

============================================================
STAGE 7 — FULL INTERNAL LINK CHECK
============================================================

THIS IS MANDATORY.

Perform an automated link check across the application.

Check every internal link you can statically identify, including:

- `<a href>`
- React Router links
- Next/Vite-style navigation where applicable
- `Link` components
- navigation configuration
- footer links
- header links
- product links
- category links
- checkout links
- account links
- admin navigation
- programmatically constructed internal URLs where detectable

For every internal URL:

VERIFY that the destination actually exists.

Flag:

- 404
- 400
- 500
- malformed URL
- nonexistent route
- broken dynamic route
- incorrect path
- incorrect casing

Do NOT stop after checking the homepage.

Crawl/check all reachable application routes where practical.

============================================================
STAGE 8 — EXTERNAL LINK CHECK
============================================================

Check external URLs referenced by the project where practical.

Verify:

- HTTP/HTTPS URLs
- official external resources
- external images
- external APIs
- external documentation links
- social links
- payment/delivery links if present

Use HEAD first where appropriate, then GET when HEAD is unsupported.

Treat these as failures:

- DNS failure
- connection failure
- invalid URL
- persistent 4xx
- persistent 5xx

IMPORTANT:

Some websites block automated HEAD/GET requests or require browser
execution.

Do NOT falsely classify a site as broken solely because it blocks
automated requests.

If an external server blocks automated validation but the URL is
syntactically valid, report it separately as:

"UNVERIFIED — external server blocks automated checking"

Do NOT change a legitimate URL simply because automated checking is
blocked.

============================================================
STAGE 9 — LINK CHECK MUST INCLUDE CODE-GENERATED LINKS
============================================================

Do not only grep for literal URLs.

Inspect places where URLs are generated from:

- product slugs
- category slugs
- IDs
- query parameters
- route parameters
- CMS data
- configuration

For example:

/product/${slug}

must produce valid routes for actual products.

Check representative real data where possible.

============================================================
STAGE 10 — WILAYA / COMMUNE VALIDATION
============================================================

The Atlas checkout contains a hardcoded Algeria Wilaya/Commune dataset.

Validate it as part of the release.

DO NOT move it into Prisma.

DO NOT move it into PostgreSQL.

DO NOT create a database migration for it.

Verify:

69 Wilayas
1541 Communes

Wilaya codes must be:

01–69

Critical mappings:

57 — El Meghaier — المغير
58 — El Meniaâ — المنيعة
59 — Aflou — أفلو
60 — Barika — بريكة
61 — El Kantara — القنطرة
62 — Bir El Ater — بئر العاتر
63 — El Aricha — العريشة
64 — Ksar Chellala — قصر الشلالة
65 — Aïn Ouessara — عين وسارة
66 — Messaad — مسعد
67 — Ksar El Boukhari — قصر البخاري
68 — Bou Saâda — بوسعادة
69 — El Abiodh Sidi Cheikh — الأبيض سيدي الشيخ

Verify:

- no duplicate Wilaya codes
- no missing codes
- no duplicate communes
- every commune belongs to a valid Wilaya
- Commune selection is filtered by Wilaya
- changing Wilaya clears the previous Commune
- invalid Wilaya/Commune combinations cannot be selected

============================================================
STAGE 11 — PRODUCT DATA AUDIT
============================================================

Inspect product data.

Verify:

- every product has a valid identifier
- every product has valid required fields
- product images resolve
- product links resolve
- category references are valid
- variation data is valid
- prices are valid
- no malformed objects exist
- no accidental duplicate product entries were introduced

Product galleries must never contain unrelated product images.

Do not silently mix product assets.

============================================================
STAGE 12 — CHECKOUT AUDIT
============================================================

Verify the checkout functionality.

Check:

- product selection
- quantity
- cart
- Wilaya
- Commune
- full name
- phone
- confirm phone
- address
- notes
- email if present
- delivery fee
- total
- Cash on Delivery
- order submission
- order confirmation

Do not introduce online card payment systems.

Atlas uses Cash on Delivery.

============================================================
STAGE 13 — BUILD
============================================================

Run the ACTUAL production build:

npm run build

Do not assume it works.

Wait for the complete result.

The build must finish successfully.

If the project uses:

vite build

followed by:

esbuild server.ts --bundle --platform=node --format=cjs
--packages=external --sourcemap --outfile=dist/server.cjs

verify BOTH stages.

If build fails:

FIX THE ROOT CAUSE.

Then run the complete build again.

Do not stop at the first apparent fix.

============================================================
STAGE 14 — TYPECHECK
============================================================

Run the project's typecheck.

If the project has:

npm run typecheck

use it.

If not, determine the correct existing TypeScript validation.

There must be:

ZERO TypeScript errors.

Warnings may be reported separately, but no actual type/build error
may remain.

============================================================
STAGE 15 — LINT
============================================================

Run the existing lint command.

For example:

npm run lint

Use the project's actual configured lint system.

Do NOT rewrite the lint configuration simply to make the build pass.

Do NOT disable rules globally.

Fix genuine errors.

============================================================
STAGE 16 — TESTS
============================================================

Run all existing automated tests.

Do not skip tests.

Do not modify tests simply to make them pass unless the test itself
is genuinely incorrect and the reason is understood.

If no test suite exists, do not invent a giant testing framework just
for this task.

Instead perform the available static/build/runtime checks.

============================================================
STAGE 17 — SECURITY / SECRET SCAN
============================================================

Scan the repository for accidentally committed secrets.

Look for:

- API keys
- private keys
- passwords
- database credentials
- tokens
- service account credentials
- .env files
- hardcoded authentication secrets

Do NOT expose secrets in output.

If a real secret is found in tracked files:

STOP.

Do not push.

Report the file and type of issue without printing the secret value.

============================================================
STAGE 18 — ENVIRONMENT VARIABLE AUDIT
============================================================

Inspect environment variable usage.

Find:

process.env.*
import.meta.env.*

Verify required variables are documented and the build does not
reference missing variables in a way that causes production failure.

Do NOT commit actual production secrets.

Use .env.example where appropriate.

============================================================
STAGE 19 — DEAD / DUPLICATED DATA AUDIT
============================================================

Search for duplicated datasets.

Especially check:

- Wilaya arrays
- Commune arrays
- product datasets
- shipping mappings
- category mappings
- route definitions
- configuration constants

There must not be two conflicting versions of the same Atlas data.

If an old Wilaya dataset remains and is still referenced:

FIX THE REFERENCE.

Do not leave stale production data in active code.

============================================================
STAGE 20 — FORMAT / PARSE CHECK
============================================================

Validate JSON files.

Validate configuration files.

Validate TypeScript source.

Validate package.json.

Validate lockfile consistency.

Find malformed JSON or configuration.

Do not manually "fix" lockfiles unless necessary.

Prefer the project's package manager.

============================================================
STAGE 21 — VERCEL PRODUCTION COMPATIBILITY
============================================================

The project is deployed on Vercel.

Make sure the project works in a Linux production environment.

Pay special attention to:

- case-sensitive imports
- filesystem paths
- server/client boundaries
- Node compatibility
- build-time environment variables
- static assets
- server bundle generation
- unsupported browser-only APIs used server-side
- unsupported Node-only APIs used client-side

Do not make development-only assumptions.

============================================================
STAGE 22 — CLEAN BUILD
============================================================

After all fixes:

remove only legitimate generated build artifacts if the project
normally generates them.

Then perform a CLEAN production build where practical.

The final production build must succeed from the repository state
that will actually be pushed.

============================================================
STAGE 23 — FINAL FULL VALIDATION
============================================================

Run the complete validation sequence again from the beginning.

At minimum:

1. Git status
2. source corruption scan
3. merge conflict scan
4. dependency/import check
5. asset check
6. route check
7. internal link check
8. external link check
9. Wilaya/Commune validation
10. TypeScript check
11. lint
12. tests
13. secret scan
14. production build
15. Git diff review

Do not assume a previous successful partial check is still valid
after later modifications.

============================================================
STAGE 24 — REVIEW THE FINAL DIFF
============================================================

Run:

git status
git diff
git diff --stat

Read the final diff carefully.

Verify that every changed file is intentional.

Look for:

- accidental files
- debug code
- console logs
- temporary scripts
- generated files
- test artifacts
- unrelated formatting changes
- accidental deletions
- accidental large files
- secrets
- duplicated data
- incomplete TODOs
- commented-out broken code

Do NOT push unrelated modifications.

============================================================
STAGE 25 — FINAL ERROR POLICY
============================================================

The following are HARD BLOCKERS:

❌ TypeScript error
❌ JavaScript syntax error
❌ JSX syntax error
❌ Vite build error
❌ server build error
❌ failed existing test
❌ broken internal link
❌ broken local asset
❌ unresolved import
❌ malformed JSON
❌ merge conflict
❌ secret detected
❌ invalid Wilaya/Commune mapping
❌ missing required production route
❌ runtime-breaking error
❌ corrupted source file
❌ invalid package/dependency state

ANY ONE OF THESE = DO NOT PUSH.

============================================================
STAGE 26 — WARNINGS
============================================================

Warnings must NOT automatically be ignored.

Investigate warnings.

If a warning indicates a real production risk, fix it.

For example:

- missing dependency
- deprecated API causing future failure
- failed asset generation
- security warning
- invalid configuration
- dependency install script required for functionality

Do not suppress warnings merely to obtain a clean-looking log.

However, do not make unrelated dependency upgrades just because a
package reports a funding message or harmless informational warning.

============================================================
STAGE 27 — ONLY AFTER EVERYTHING PASSES
============================================================

ONLY when ALL required checks pass:

show a concise release summary containing:

BUILD: PASS
TYPECHECK: PASS
LINT: PASS
TESTS: PASS
INTERNAL LINKS: PASS
EXTERNAL LINKS: PASS / UNVERIFIED ITEMS LISTED
LOCAL ASSETS: PASS
IMPORTS: PASS
WILAYAS: PASS
COMMUNES: PASS
SECURITY SCAN: PASS
GIT DIFF: REVIEWED

Then show exactly which files were changed.

ONLY AFTER THAT may you commit and push.

============================================================
GIT COMMIT
============================================================

Create a clear commit message describing the actual changes.

Do not include unrelated changes.

Before pushing, run:

git status

one final time.

The working tree must contain only intentional changes.

============================================================
GIT PUSH
============================================================

Push ONLY after the complete validation gate passes.

If any blocker remains:

DO NOT PUSH.

Instead report:

BLOCKED — [exact failure]

and continue fixing it.

============================================================
MOST IMPORTANT RULE
============================================================

NEVER optimize for "getting the deployment out."

Optimize for:

CORRECT
VALIDATED
BUILDABLE
LINK-CLEAN
SECURE
DEPLOYABLE
PRODUCTION-READY

Do not push until the project passes the complete quality gate.

If something fails, fix it at the root cause and rerun the relevant
check AND the final complete validation sequence.

NO SHORTCUTS.
NO "GOOD ENOUGH."
NO "IT SHOULD WORK."
NO PUSH WITH KNOWN ERRORS.