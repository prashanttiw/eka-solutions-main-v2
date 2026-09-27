// Canonical/OG URLs need one absolute origin. This assumes the eventual production
// domain (it already matches the contact email and WhatsApp-facing identity); update it
// here once a custom domain is actually pointed at the deployment.
export const SITE_URL = 'https://ekasolution.com';

export const PAGES = [
  {
    path: '/',
    id: 'home',
    label: 'Home',
    eyebrow: 'Welcome',
    title: 'EKA Solution — Make the complex clear.',
    line: 'Design and engineering around your business.',
    description:
      'EKA Solution brings design and engineering together for websites, applications, and smarter business workflows.',
  },
  {
    path: '/about',
    id: 'about',
    label: 'About',
    eyebrow: 'Who we are',
    line: 'The purpose and principles behind EKA.',
    description:
      'Get to know EKA Solution and our approach to useful software, thoughtful design, and clear collaboration.',
  },
  {
    path: '/services',
    id: 'services',
    label: 'Services',
    eyebrow: 'What we do',
    line: 'Websites, applications, design, and automation.',
    description:
      'Explore website and application development, product design, AI and automation, and cloud services with EKA Solution.',
  },
  {
    path: '/work',
    id: 'work',
    label: 'Work',
    eyebrow: 'A closer look',
    line: 'The thinking behind our own digital home.',
    description:
      'Explore the design and engineering decisions behind the EKA Solution website, an in-house project.',
  },
  {
    path: '/playbook',
    id: 'playbook',
    label: 'Playbook',
    eyebrow: 'How we work',
    line: 'A clear path from the first conversation to launch.',
    description:
      'Understand how EKA approaches discovery, design, development, and handover, and explore ways to work together.',
  },
  {
    path: '/careers',
    id: 'careers',
    label: 'Careers',
    eyebrow: 'Connect with us',
    line: 'Share your work and explore opportunities.',
    description:
      'Interested in thoughtful engineering and design? Introduce yourself to EKA Solution and ask about current opportunities.',
  },
];
export const CONTACT = {
  path: '/contact',
  id: 'contact',
  label: 'Contact',
  eyebrow: 'Start here',
  line: 'Tell us what you want to build, improve, or simplify.',
  description:
    'Discuss a project with EKA Solution. Prepare a project enquiry or get in touch by email or WhatsApp.',
};
export const ALL_PAGES = [...PAGES, CONTACT];

// The primary reading journey is for someone evaluating EKA for a project. Careers serves
// a different audience, so it remains visible in the navigation but does not interrupt the
// client story in the previous/next links at the foot of each page.
export const STORY_PAGES = [
  ...PAGES.filter((page) => page.id !== 'careers'),
  CONTACT,
];

export const pageByPath = (path) =>
  ALL_PAGES.find((page) => page.path === path) ?? null;
