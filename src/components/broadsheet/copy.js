/**
 * The text of the paper.
 *
 * Every factual sentence here already existed on the Playbook page before it was
 * set as a broadsheet — the stages, their durations, the outputs, the six
 * standards, the four ways to begin. What changed is the furniture around them:
 * kickers, decks, pull quotes, captions and folio lines, which are what turn a
 * stack of cards into a page someone reads.
 *
 * Nothing was added. This company has no published clients, metrics, awards or
 * testimonials, so the paper has no front-page photograph of a happy customer
 * and no circulation figures. A newspaper voice is a way of organising what is
 * true, not a licence to print what would be convenient.
 */

export const NAMEPLATE = 'The EKA Playbook';

export const FOLIO = [
  'Published by EKA Solution',
  'Vol. I — No. 01',
  'The complete method, start to finish',
  'Price: Free',
];

export const BAR = {
  left: 'EKA Solution',
  right: 'How we work — in full',
};

export const FRONT = {
  kicker: 'The Playbook — Issue One',
  headTop: 'A clear path.',
  headKnock: 'From idea to launch.',
  deck:
    'Understand the goal, agree on a plan, and review the work as it takes shape. Here is how we approach the journey together.',
  byline: 'Filed by EKA Solution',
  dateline: 'For anyone deciding who to build with',
  standfirst:
    'The same process runs on a two-week audit and a two-year platform. The stages compress; they do not get skipped.',
  stamp: [
    { key: 'Subject', val: 'How a project actually runs' },
    { key: 'Edition', val: 'The Playbook' },
    { key: 'Inside', val: 'Four stages · Six rules · Four ways to begin' },
  ],
  contents: [
    { no: '01', label: 'The four stages', note: 'Orient, Design, Build, Run — and what strains in each' },
    { no: '02', label: 'The first quarter', note: 'The same four stages against a calendar' },
    { no: '03', label: 'House rules', note: 'Six standards we will be held to' },
    { no: '04', label: 'Ways to begin', note: 'Four shapes an engagement can take' },
  ],
};

export const STAGES = [
  {
    id: 'orient',
    kicker: 'Stage One — Week 1–2',
    head: 'Orient',
    deck: 'Understand it before designing it.',
    subject: 'orient',
    body: [
      'Before a line is drawn, we learn the business, the constraints and what is already there. Interviews with the people who will use the thing and the people who will have to maintain it. A read of the existing system.',
      'The constraints that are real — regulatory, contractual, political — get separated from the ones that are only habit. That separation is most of the value of the stage.',
    ],
    output: 'Problem statement, constraint map, and the questions that decide the design',
    quote:
      'The stated problem is rarely the real one. We keep asking past the first answer, which can feel slow in week one.',
    caption:
      'The instrument you reach for before building anything: it tells you where you actually are, not where the map says you should be.',
    credit: 'Engraving — EKA Solution',
  },
  {
    id: 'design',
    kicker: 'Stage Two — Week 2–4',
    head: 'Design',
    deck: 'Decide on paper, where it is cheap.',
    subject: 'design',
    body: [
      'Architecture, data model, integration boundaries and the interface work — each carrying the alternatives we rejected and the reason we rejected them. Estimates get attached at this point, when they are worth something rather than when they are a guess.',
      'A decision made on the drawing board costs an afternoon. The same decision made in week nine costs a rewrite, which is the whole argument for this stage existing.',
    ],
    output: 'Architecture decision records, data model, delivery plan with estimates',
    quote:
      'Design can expand to fill any time given to it. We time-box it and ship the first increment against an incomplete picture on purpose.',
    caption:
      'The board, the square and the curve. Everything here is still cheap to change, which is exactly why the arguments belong at this table.',
    credit: 'Engraving — EKA Solution',
  },
  {
    id: 'build',
    kicker: 'Stage Three — Week 4 onward',
    head: 'Build',
    deck: 'Working software every two weeks.',
    subject: 'build',
    body: [
      'Two-week increments, each ending in something deployed rather than demonstrated. You see the board, the repository and the standups; there is no separate version of progress kept for the client.',
      'Scope changes are priced as they arrive, rather than absorbed silently and paid for later in quality. That is the difference between a plan and a wish.',
    ],
    output: 'Deployed increments, test suites, runbooks, decision records kept current',
    quote:
      'Velocity dips in the third increment when the real integrations land. We plan for it rather than quietly rescheduling around it.',
    caption:
      'The press and the forme locked up beside it. Every fortnight something comes off the machine, or the fortnight did not count.',
    credit: 'Engraving — EKA Solution',
  },
  {
    id: 'run',
    kicker: 'Stage Four — Ongoing or exit',
    head: 'Run',
    deck: 'Own it, or hand it over cleanly.',
    subject: 'run',
    body: [
      'Monitoring, on-call, patching and cost management under a written service level — or a handover, with pairing, documentation review, and a period where your engineers lead while we answer questions.',
      'Both are normal endings here. An engagement that can only continue is not a service, it is a dependency.',
    ],
    output: 'SLA reporting and quarterly architecture review, or a completed handover',
    quote:
      'Handovers fail when they are one document at the end. Ours are a fortnight of your team driving while we watch.',
    caption:
      'The light kept on, and swept. What happens after launch is what decides whether any of the rest of it mattered.',
    credit: 'Engraving — EKA Solution',
  },
];

export const SCHEDULE = {
  head: 'A typical first quarter',
  note: 'Because “how long until we see something” is the question the stages do not answer directly.',
  stops: [
    { when: 'Day 0', what: 'First call', sub: 'Fit, scope, budget range' },
    { when: 'Week 1', what: 'Orient', sub: 'Constraints and problem' },
    { when: 'Week 2', what: 'Design', sub: 'Architecture and plan' },
    { when: 'Week 4', what: 'Build', sub: 'First increment deployed' },
    { when: 'Week 12+', what: 'Run', sub: 'Operate or hand over' },
  ],
};

export const HOUSE_RULES = {
  kicker: 'A standing feature',
  head: 'House rules',
  deck:
    'Anyone can list the same frameworks we do. These are the six that survive a deadline — they are in every statement of work, and you are entitled to hold us to them.',
  rules: [
    {
      num: '01',
      rule: 'Nothing reaches production without a review and a test',
      detail:
        'Coverage gates on changed lines, enforced by the pipeline rather than by good intentions. A red build cannot be merged by anyone, including us.',
    },
    {
      num: '02',
      rule: 'Every environment is defined in code',
      detail:
        'Terraform for infrastructure, containers for runtime. No console-clicked resources, so staging genuinely resembles production and a rebuild is an afternoon.',
    },
    {
      num: '03',
      rule: 'Performance budgets are acceptance criteria',
      detail:
        'p95 latency and bundle weight are written into the ticket alongside the behaviour. A feature that ships and slows the product down has not shipped.',
    },
    {
      num: '04',
      rule: 'No standing human access to production data',
      detail:
        'Access is brokered, time-boxed and logged. Least privilege by default — which is also most of what a SOC 2 auditor will ask you to demonstrate.',
    },
    {
      num: '05',
      rule: 'Decisions are written down where the code is',
      detail:
        'Architecture decision records in the repository, with the alternatives and the trade-off. Six months later the reason is still there, whoever is reading it.',
    },
    {
      num: '06',
      rule: 'You can end the engagement on a Friday',
      detail:
        'Documentation, runbooks and credentials stay current as a working practice. A handover is a normal week for us, not a project of its own.',
    },
  ],
};

export const LISTINGS = {
  head: 'The working stock',
  note: 'Reference material, not argument — the standards above are the part that is hard to copy.',
  rows: [
    [
      'TypeScript', 'React 19', 'Next.js', 'Node', 'Go', 'Rust', 'Python',
      'PostgreSQL', 'Redis', 'ClickHouse', 'Kafka', 'GraphQL', 'tRPC', 'WebGL',
    ],
    [
      'AWS', 'GCP', 'Cloudflare', 'Kubernetes', 'Terraform', 'Pulumi', 'Docker',
      'GitHub Actions', 'OpenTelemetry', 'Grafana', 'Datadog', 'pgvector',
      'LangGraph', 'LLM APIs', 'Playwright',
    ],
  ],
};

export const CLASSIFIEDS = {
  kicker: 'Notices',
  head: 'Ways to begin',
  deck:
    'Four shapes an engagement can take. Each has a duration, a pricing model and a starting condition, so the next step is a decision rather than a guess.',
  ads: [
    {
      id: 'sprint-zero',
      head: 'Discovery & planning',
      tagline: 'Find the right starting point.',
      meta: [
        ['Duration', 'Short engagement'],
        ['Pricing', 'Scoped proposal'],
        ['Starts', 'Agreed together'],
      ],
      summary:
        'For an idea that needs definition or a system that needs a fresh look. Explore the problem, review the options, and leave with a practical plan.',
      includes: [
        'Goals, constraints, and priorities',
        'User journeys and technical options',
        'Risks and open questions',
        'Recommended scope and next steps',
      ],
      notFor:
        'A fully defined task that is ready to build; a focused implementation may be a better fit.',
    },
    {
      id: 'squad',
      head: 'Team collaboration',
      tagline: 'Add focused help to your existing team.',
      meta: [
        ['Duration', 'Ongoing collaboration'],
        ['Pricing', 'Scope and capacity based'],
        ['Starts', 'Subject to availability'],
      ],
      summary:
        'For teams that need support on a product, a specialist problem, or a larger roadmap. Agree on responsibilities and a working rhythm that fits your team.',
      includes: [
        'A defined area of responsibility',
        'Shared planning and review',
        'Work within agreed tools and processes',
        'Regular progress and priority discussions',
      ],
      notFor:
        'A standalone deliverable that is easier to agree and review as a fixed project.',
    },
    {
      id: 'build',
      head: 'Project delivery',
      tagline: 'Take a defined idea through to launch.',
      meta: [
        ['Duration', 'Milestone based'],
        ['Pricing', 'Project proposal'],
        ['Starts', 'After scope agreement'],
      ],
      summary:
        'For a website, application, or business tool with a clear goal. Define the deliverables, review the work at agreed milestones, and prepare the product for release.',
      includes: [
        'Scope and acceptance criteria',
        'Design and development milestones',
        'Testing and release preparation',
        'Documentation and handover',
      ],
      notFor:
        'An idea still changing fundamentally; discovery can help establish the right first version.',
    },
    {
      id: 'run',
      head: 'Ongoing improvement',
      tagline: 'Keep your software useful as your business changes.',
      meta: [
        ['Duration', 'Agreed review cycle'],
        ['Pricing', 'Support proposal'],
        ['Starts', 'After a system review'],
      ],
      summary:
        'For an existing product that needs attention after launch. Prioritize maintenance, improvements, and performance work around the needs of your business.',
      includes: [
        'A review of the existing system',
        'A prioritized improvement plan',
        'Agreed maintenance responsibilities',
        'Defined support hours and escalation',
      ],
      notFor:
        'Unspecified round-the-clock coverage; support scope and response expectations must be agreed first.',
    },
  ],
};

export const MARQUEE = 'Built for you. Built to last.';

export const COLOPHON = {
  cta: {
    head: 'Start a conversation',
    body: 'Tell us the goal and the constraints. We will tell you which of the four shapes above fits, and what the first fortnight looks like.',
    label: 'Get in touch',
  },
  imprint: [
    {
      title: 'The paper',
      body: 'Set in Playfair, Newsreader and Courier Prime. Pictures screened at five points. Printed on the web, in one ink and one spot colour.',
    },
    {
      title: 'The publisher',
      body: 'EKA Solution — design and engineering built around a business goal, with a clear path from the first conversation to launch.',
    },
  ],
};
