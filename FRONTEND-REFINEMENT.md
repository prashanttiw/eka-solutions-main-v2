# Frontend refinement — 6 September 2026

Local changes in `eka solutions main/`. Nothing committed, pushed, or deployed.

## Direction

**Built for you. Built to last.** Design and engineering around a business goal, with
clear communication from the first conversation through handover. Copy remains a proposed
public positioning, not a new confirmation of company capabilities or contractual terms.

The cream canvas, blue typography, capsule navigation, hero globe, and mountain footer
remain the visual identity. Inner-page wireframes, chrome ornaments, tilt cards, flip cards,
and decorative paper textures no longer appear in the active page content. The body uses
readable service rows, a numbered delivery process, restrained entrances, and clear links.
The shared route sequence now follows the visitor decision path: Home, Services, Work, About,
Playbook, Careers, Contact. The public site is company-led rather than founder-led: the
team/founder story and its dedicated route were removed so the work, standards, and process
carry the proof.

## Page changes

| Page | Result |
| --- | --- |
| Home | Concise hero copy, four service entry points, work evidence before project clarity, and a direct invitation to talk. |
| About | Clear company introduction and three practical principles; unsupported numerical proof removed. |
| Services | Visible service scope, specific enquiry links, custom-workflow discussion, and business contexts described as examples. |
| Playbook | Four readable delivery stages, quality priorities, and keyboard-accessible engagement tabs without invented prices or start dates. |
| Work | The fuller review build now includes the previous case-study set, interactive project book, and testimonial marquee so each can be judged before pruning. |
| Team | Removed from the public experience; founder/team presentation is not part of the current company-led story. `/team` now resolves to the recovery page. |
| Careers | The previous six-role opening list and in-place four-step application flow are active again; the form keeps a local draft and shows an explicit local confirmation because no backend submission is connected. |
| Contact | Labelled, validated project brief with review/edit, email draft, and copy fallback; no false submission success. |
| 404 | Clear recovery links; no decorative rotating object. |

The contact brief updater now applies field changes from the latest form state, so rapid
typing or browser autofill cannot overwrite a neighbouring field update.

Footer copy and destinations were revised without changing its structure, classes, mountain
renderer, or animation. Nonexistent legal links were replaced with working destinations;
this does not constitute publication of privacy or legal policies.

## Verification

- Production build passed. Existing large Three.js/globe chunk warning remains.
- Lint passed with one existing `Navbar.jsx` state-in-effect warning; navbar source preserved.
- All seven active routes and the 404 render one H1 at 1280px; no document-width overflow.
- Link audit inspected the rendered link instances across the active routes; no broken internal
  route or fragment destinations.
- All inner routes and 404 checked at 375px for horizontal text/field overflow: none found.
- Mobile services inspected visually; navigation menu opens and closes after route selection.
- Contact brief review, encoded email destination, edit retention, and FAQ disclosure checked
  with synthetic local values. No email or WhatsApp message was sent.
- Engagement tabs checked using ArrowRight and End, including selected state and mobile panel.
- Revalidated direct route loads, one-H1-per-page, deep section anchors, service-to-contact
  selection, FAQ disclosure, Escape-to-close navigation, and brief review/edit behavior in
  the local preview. No external message was sent.
- Revalidated the visitor-first route order in the menu and page-to-page navigation, and
  reserved space so the fixed WhatsApp affordance does not cover the final homepage CTA.
- Browser error log showed no JavaScript errors during the checks.
- Protected renderer and navbar files match hashes taken at the start of this work.
  `index.css` is byte-identical to the starting working copy. Hero edits are copy and link
  destinations only; its pre-existing uncommitted animation changes were preserved.

## Boundaries and follow-up facts

The backend was not edited or connected. The project brief opens an email draft that the
visitor sends themselves. Career enquiries also use email. This is deliberate, observable
behavior until an explicitly scoped API integration is implemented.

No client-facing portal URL or confirmed portal feature list was supplied. The site discusses
custom portals as a possible solution, and does not invent a live EKA client portal or login.

Named commercial products, client references, cohort capacity, staffing numbers, vacancies,
certifications, response-time guarantees, and contractual terms need owner confirmation
before being represented as facts. The previous `ProjectBook` and `Testimonials` sources are
active again for review. The careers application components are active again, but their local
confirmation is not a delivered application until a verified backend submission is connected.

The existing protected navbar is cramped at 320px. Its layout was not changed under the
instruction to preserve the header. The primary responsive checks use 375px; the hero copy
was also shortened against a 320px phone check.
