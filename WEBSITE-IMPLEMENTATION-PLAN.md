# EKA website refinement — implementation prompt

You are the implementing model. Improve EKA Solution’s public website according to this plan. Work in small phases, verify each phase, and keep the existing visual identity. Do not redesign things just to make them different.

## 1. Business goal and definition of success

The website should help the right visitors understand EKA, trust its approach, explore relevant services, and start a useful conversation.

Design for this visitor journey:

**Understand the offer → find a relevant service → assess the work and people → understand the process → discuss a project.**

Every section must support at least one of those steps. Every animation must clarify an interaction, direct attention, or express the brand without interfering with reading.

Success means:

- A first-time visitor can explain what EKA does after reading the first screen.
- A visitor can reach a relevant service and its enquiry action without searching through unrelated content.
- The website looks cohesive across pages and screen sizes.
- Claims are credible; buttons and forms behave exactly as their labels promise.
- Motion feels intentional and polished, with fast access to readable content.
- Visitors can choose a useful next step on every page.

Do not optimize for time on page alone. A clear site may help people enquire sooner. Visual refinement can improve understanding and conversion; it cannot by itself guarantee more traffic. Track acquisition and conversion separately if analytics is later authorized.

## 2. Mandatory starting context

Read these files before editing:

1. `../memory/projects/eka-main-website.md`
2. `../memory/projects/eka-solutions.md`
3. `../memory/context/working-method.md`
4. `FRONTEND-REFINEMENT.md`
5. The actual source files and current Git diff.

### Important working-tree state

As of 6 September 2026, this repository has substantial **uncommitted edits** from an earlier refinement pass. The user then requested this implementation plan for a lower-cost model.

Those edits are a candidate implementation, not final user approval. Some proposed changes below may already exist. Inspect the rendered result, keep what satisfies the goal, and fix only the gaps. Do not rebuild every component just because it appears in this document.

There were also pre-existing uncommitted hero/globe changes before the refinement started. Preserve them. Do not reset files to HEAD to obtain a “clean” starting point.

Treat this document as the implementation brief. Treat the earlier report as context, not a substitute for checking the current UI.

## 3. Non-negotiable boundaries

- Work only in `eka solutions main/`, the public frontend repository.
- Do not edit, start work in, or integrate `../eka-backend-main/` under this brief.
- Do not commit, push, deploy, install new dependencies, or change hosting without explicit authorization.
- Preserve the **navigation/header design**, **hero globe**, and **animated mountain footer**. Their text and link destinations may improve; their layout, renderer, visual effects, and animation must remain intact.
- Preserve the cream background and blue-ink palette. Keep the existing font families and tokens. Avoid unrelated colors and additional dark section backgrounds.
- Preserve the public spelling **EKA Solution** until the owner confirms a naming change.
- Do not invent customers, testimonials, founder identities, team size, results, product availability, certifications, vacancies, prices, start dates, or response guarantees.
- Never display “sent,” “received,” or equivalent success unless an actual successful submission has occurred.
- Do not turn this into an expensive rewrite or a new framework migration.

Protected files/areas:

- `src/components/Navbar.jsx`
- `src/components/HeroParticleGlobe.jsx`
- `src/components/HeroCodeTrace.jsx`
- `src/components/HeroStarField.jsx`
- `src/components/heroGlobeGeometry.js`
- The structure, classes, and motion logic in `src/components/Hero.jsx`
- The `.hero-*` styles and their supporting animation rules in `src/index.css`
- `src/components/FooterMountainParticles.jsx`
- The layout, artwork layers, and classes in `src/components/Footer.jsx`

Capture the current versions before work so you can verify preservation against the starting working tree, not against HEAD.

## 4. Content truth and positioning

Confirmed context: EKA is being built by Prashant Tiwari and his co-founder. The co-founder’s name and role are not recorded. The owner reports that the backend is ready; that does not establish a public client portal URL or verified client-facing functionality.

The current candidate headline is **“Built for you. Built to last.”** Treat it as a draft. Its supporting sentence must immediately explain the offer, for example:

> Thoughtful design and engineering for websites, applications, and everyday business.

The proposed differentiator is **design and engineering working together, with a clear path from the first conversation to launch**. Develop this through concrete information about scope, review, decisions, and handover. Do not support it with fabricated scale or performance numbers.

### Portal decision

The owner wants the website and portal to have a clear reason to choose EKA. Before publishing a portal claim, obtain the actual audience, URL, available features, and access process. Do not infer a client project portal from the existence of a backend/admin console.

- If a client portal is confirmed, explain what clients can actually accomplish in it and provide the verified access action.
- If only an internal admin portal exists, do not market it as a client feature.
- If details remain unavailable, keep public copy focused on project clarity. Do not show a fake dashboard, login, status, or launch promise.
- Continue all independent design/copy work while this fact remains unresolved.

## 5. Phase 1 — audit the current experience

**Goal:** establish what needs improvement before changing it.

Inspect all eight routes, 404, mobile menu, footer links, section anchors, and contact interactions. Read their complete content, including labels, helper text, hidden panels, and metadata. Inspect the beginning, middle, and end of each page on desktop and mobile.

Create a compact checklist with: component/section, visitor purpose, problem, proposed change, priority, and verification.

Classify work as:

- **P0:** misleading content, broken navigation, false form success, unreadable or inaccessible controls.
- **P1:** unclear offer, weak page hierarchy, obstructive decoration, mobile layout problems.
- **P2:** finer spacing, wording, hover states, and restrained motion polish.

**Exit condition:** every live section has a purpose and a disposition: keep, refine, replace, or remove. Avoid an open-ended critique without implementation decisions.

## 6. Phase 2 — shared layout and reading system

**Goal:** make the multipage site feel like one carefully designed website.

Files: `PageHeader.jsx`, `SectionHeading.jsx`, `Editorial.jsx`, `PageNav.jsx`, `Reveal.jsx`, `src/refinement.css`, `src/site.js`, and `RootLayout.jsx`.

1. Use compact inner-page introductions: breadcrumb, one clear H1, short explanation, useful section links.
2. Remove decorative rotating wireframes from inner-page introductions. Use the space for readable composition; do not automatically fill it with another ornament.
3. Establish consistent container widths, section spacing, heading sizes, body line lengths, and CTA styles using existing tokens.
4. Use a small set of layouts: introduction, service row, process step, evidence feature, and contact invitation. Avoid making every section another rounded card grid.
5. Remove heavy body paper texture and chrome ornaments without changing hero or footer surfaces.
6. Make primary actions visually obvious. Secondary links should be quieter but still clear.
7. Keep navigation, route descriptions, page titles, and social metadata aligned.
8. Use familiar labels. Avoid copy about the website being a “document,” “argument,” “track,” or “chapter” when the visitor needs a service explanation.

**Exit condition:** the same typography, spacing, and interaction vocabulary works across routes; protected visual areas remain unchanged.

## 7. Phase 3 — refine each page section by section

### Section 1 — header and navigation

**Purpose:** make orientation and movement effortless.

Keep the capsule design. Verify route labels, active states, menu opening/closing, Escape behavior, focus handling, and the contact CTA. Update shared descriptions if needed. Do not add more competing buttons or navigation items.

The preserved header was cramped in a 320px check. Record this separately if it remains. Do not silently redesign the protected header to fix it; any required visual exception needs the owner’s direction.

### Section 2 — homepage hero

Files: `Hero.jsx`; protected renderers listed above.

**Purpose:** answer “What does EKA do, and why should I explore?”

- Keep the globe, background, layout, and scroll choreography.
- Use a short headline, a specific supporting sentence, and the two existing action positions.
- Primary action: **Start a project** → `/contact`.
- Secondary action: **View our work** → `/work`.
- Use the existing smaller invitation for a useful destination such as **See how we work** → `/playbook`, rather than an unconfirmed launch offer.
- Give the second scroll message a different role from the first: explain the benefit of the approach instead of repeating the same paragraph.
- Fit the words to the existing composition on small phones. Shorten text before changing protected sizing or spacing.

Avoid “digital empires,” impossible-to-outperform promises, and decorative technical jargon.

### Section 3 — homepage services

File: `DualTrack.jsx` (the legacy filename need not dictate the content).

**Purpose:** help visitors recognize where EKA can help.

Present a small, readable set of proposed services: websites/applications, product design, AI/automation, and cloud/reliability. Each entry needs a familiar name, one customer outcome, and a working link to the matching service section.

Do not advertise an unverified catalogue of products as established businesses. Do not hide essential service information behind rotating cards.

### Section 4 — homepage project clarity and next step

File: `SiteIndex.jsx`.

**Purpose:** give visitors a practical reason to continue.

Explain a shared brief, clear milestones/reviews, and a considered handover. A static process or project-essentials composition is appropriate if its labels carry meaning. A confirmed portal can strengthen this section later, under the portal decision above.

Offer concise links to Work and Team, then a clear contact invitation. Do not duplicate the entire navigation menu as the main homepage content.

### Section 5 — About

Files: `AboutPage.jsx`, `About.jsx`, `PointOfView.jsx`.

**Purpose:** explain EKA’s intent and working principles.

1. Introduction: who EKA is and the business problem it wants to help solve.
2. Principles: understand the business, make decisions clear, build with care.
3. Point of view: balance the first useful release with maintainability and future needs.
4. Next action: discuss a challenge or explore the process.

Replace unverified company statistics with substance. Do not replace fake metrics with vague superlatives or guarantees. Remove claims about most software failing unless supported and relevant.

### Section 6 — Services

Files: `ServicesPage.jsx`, `ServicesGrid.jsx`, `Products.jsx`, `Industries.jsx`.

**Purpose:** help a buyer assess fit and choose a conversation.

1. Page introduction: describe the business outcomes, not the organizational structure.
2. Each service: recognizable problem, short approach, three or four concrete deliverables, relevant enquiry link.
3. Connected solutions: explain custom portals, internal tools, and dashboards as possible scoped solutions, not existing named products.
4. Business contexts: explain how requirements vary by sector. Do not imply prior sector clients or compliance credentials without evidence.
5. Enquiry: carry the selected service into the contact form when practical.

Prefer readable rows or clear disclosures over front/back flips. Keep the essential offer visible without interaction. Avoid unsupported prices, durations, savings, and large-team promises.

### Section 7 — Playbook

Files: `PlaybookPage.jsx`, `Playbook.jsx`, `EngineeringStandards.jsx`, `Engagement.jsx`.

**Purpose:** reduce uncertainty about how work happens.

1. Process: Understand → Plan/design → Build/review → Launch/handover.
2. For each stage: client involvement, activity, and useful output. Avoid invented fixed week numbers.
3. Engineering priorities: usability, maintainability, testing, performance, security, continuity. Explain them in plain language.
4. Engagement options: discovery, team collaboration, project delivery, ongoing improvement. Frame scope, availability, fees, and support as matters to agree.

Keep the existing accessible tab behavior if it works. Remove unsupported contractual commitments, certification claims, start guarantees, and unverified 24/7 coverage. Replace scrolling technology marquees with a concise static list only if visitors need it.

### Section 8 — Work

Files: `WorkPage.jsx`, `CaseStudies.jsx`; review legacy `ProjectBook.jsx` and `Testimonials.jsx` before reuse.

**Purpose:** provide evidence rather than decoration.

The EKA website itself can be honestly presented as an **in-house project**: challenge, design/engineering decisions, and resulting experience. Do not disguise it as paid client work.

Add external case studies only with real projects, permission, screenshots, and supportable outcomes. If no verified testimonials exist, omit the section. No stock portraits presented as customers, fabricated quotes, or invented numerical results.

The legacy animated project book is optional. Reuse it only if genuine content benefits from that format and it remains readable on mobile and by keyboard. Otherwise prefer a simple project feature.

### Section 9 — Team

Files: `TeamPage.jsx`, `Team.jsx`, `FoundingCohort.jsx`.

**Purpose:** help visitors understand who stands behind EKA.

Use confirmed names and roles. Prashant Tiwari is confirmed; the other co-founder’s identity is not recorded. Do not invent a biography, portrait, responsibilities, or social profile. A restrained typographic profile is acceptable until real assets exist.

Remove unverified founder profiles and staffing claims. Replace the unconfirmed Founding 25 scarcity campaign with a useful invitation to talk. Keep old section anchors working where sensible.

### Section 10 — Careers

Files: `CareersPage.jsx`, `Careers.jsx`, `src/components/apply/*`.

**Purpose:** give interested people an honest route to the team.

With no confirmed vacancies, show a career-enquiry page and a clearly labelled email action. Explain what to include: area of interest, contribution to a project, and relevant work samples.

Only restore job listings, application forms, or benefits when actual roles and processes are confirmed. Do not claim a candidate applied when data stayed local. Do not promise paid interviews, equipment, locations, or response times without confirmation.

### Section 11 — Contact and FAQ

Files: `ContactPage.jsx`, `ContactTerminal.jsx`, `FAQ.jsx`, `lib/whatsapp.js`, `WhatsAppFloat.jsx`.

**Purpose:** make a useful enquiry easy and truthful.

- Keep the request short: name, email, interest, project context; company and budget/timing optional.
- Explain required fields and the real next action.
- Associate labels with controls; use appropriate input types and autocomplete.
- Keep email and WhatsApp contact values consistent with the existing site.
- For the current frontend-only scope, a **reviewable email brief** is acceptable: prepare → review/edit → open email draft → visitor sends. Clearly state that preparing a brief does not send it.
- Provide a copy fallback if an email app is unavailable; preserve entered values when editing.
- Do not add fake success/confetti or a budget the visitor did not choose.
- FAQ should answer practical questions: what to bring, existing products, scope/cost/timing, collaboration, handover, ownership to agree, and how to enquire.

A real API submission flow is a separate, explicitly authorized integration task. It must use the backend contract and verify success/error states rather than guessing endpoints.

### Section 12 — footer, 404, and supporting content

Files: `Footer.jsx`, `NotFoundPage.jsx`, `Preloader.jsx`, `PageNav.jsx`, `index.html`, `site.js`.

- Preserve the mountain and footer composition exactly. Improve the brand sentence and destinations.
- Remove or replace links to nonexistent legal pages. Do not invent legal documents to fill navigation slots.
- Give 404 a clear explanation and routes back to useful pages.
- Keep loading copy simple and truthful; avoid invented engineering status messages.
- Align page titles/descriptions and preview metadata with actual page content.
- Check every remaining helper label, icon-only action, and previous/next description.

**Phase 3 exit condition:** every live section has clear copy, credible content, and a useful place in the visitor journey.

## 8. Phase 4 — motion, accessibility, and responsive polish

**Goal:** retain visual character while making the site comfortable to use.

- Keep the globe and mountain as the signature animations. Do not compete with them using additional continuously rotating objects.
- Prefer brief fades, small positional entrances, and restrained hover/focus feedback. Do not animate every paragraph independently or delay the initial message.
- Keep content readable while animations initialize. Large hidden sections must not remain blank because a reveal threshold cannot be reached.
- Do not hide key information behind hover, tilt, or a 3D flip.
- Respect reduced-motion preferences. Newly added motion should stop or simplify without removing content.
- Stop offscreen work if adding any animation loop; prefer the existing shared motion utilities.
- Check at 375px, 768px, and 1280px. Also inspect 320px for text fit and report protected-header constraints separately.
- Check normal motion, keyboard focus, touch interaction, long content, and slow asset loading.
- Do not introduce a new animation library or Three.js scene for this work.

Related components: `Reveal`, `RevealImage`, `TiltCard`, `ChromeObject`, `InkLattice`, `InkPlate`, `CountUp`, `CustomCursor`, and `lib/scrollDriver.js`. Inspect usage before editing. Unused legacy components do not need a rewrite; do not delete them merely for tidiness.

## 9. Phase 5 — verification and handover

Run `npm run lint`, `npm run build`, and `git diff --check`. Fix new failures. Record existing warnings separately; do not alter protected areas just to make a warning disappear.

Verify the actual browser experience:

- Every route renders, including direct loads and 404.
- One H1 per page; coherent headings and readable text.
- All internal routes and section links resolve.
- No horizontal clipping of essential text, fields, or actions.
- Mobile menu and keyboard navigation work.
- Service enquiry links select the expected interest.
- Contact validation, review/edit, email encoding, and fallback states work with synthetic data.
- FAQ disclosures and engagement tabs work with keyboard and touch.
- No external message is sent during testing.
- No new browser errors, unnecessary animation loops, or broken images.
- Header, globe, and mountain visuals match the starting working copy.
- Source changes are confined to the agreed frontend scope.

Review the page visually after changes rather than treating a passing build as visual verification.

Update `FRONTEND-REFINEMENT.md` with what was actually implemented, checks performed, and unresolved facts. Provide a concise handover with a local preview and the important limitations. Stop when the acceptance criteria are satisfied; avoid repeated cosmetic rewrites.

## 10. Working rules for the implementing model

1. Start with a short statement of the phase and intended user benefit.
2. Read the relevant components together; avoid repeatedly scanning the entire repository.
3. Reuse existing satisfactory changes. Work on one phase or closely related section group at a time.
4. Prefer small changes and existing primitives over abstraction-heavy rewrites.
5. Do not ask permission for routine reversible frontend edits already authorized by this brief.
6. Ask only for missing business facts that materially affect published claims, or explicit exceptions to protected design boundaries. Continue independent work meanwhile.
7. Do not create other tasks, spawn agents, or add recurring automations unless asked.
8. Keep explanations short; put durable decisions and verification in the handover document.
9. Never claim completion of a check you did not run.
10. Stop before committing, pushing, deployment, backend integration, or publishing unconfirmed claims.

The final result should feel recognizably EKA: distinctive at the hero and footer, clear and considered everywhere between them.
