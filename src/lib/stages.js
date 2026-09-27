// The four stages of a project, shared by the homepage path and the Playbook page so the two
// can never describe the process differently.
export const STAGES = [
  {
    number: '1',
    verb: 'Understand',
    line: 'Find the real problem.',
    text: 'We listen to the people involved, trace how the work happens today and name the decision the project needs to make easier.',
    questions: ['Who feels this problem, and when?', 'What happens today, step by step?', 'What would “better” look like in a month?'],
    output: 'A shared, written picture of the situation',
  },
  {
    number: '2',
    verb: 'Frame',
    line: 'Choose a useful first move.',
    text: 'We compare possible approaches, make the assumptions visible and agree on what the first release needs to prove.',
    questions: ['What is the smallest release that helps?', 'Which assumptions carry the most risk?', 'What are we deliberately leaving out?'],
    output: 'A clear scope, plan and working direction',
  },
  {
    number: '3',
    verb: 'Build',
    line: 'Work in reviewable pieces.',
    text: 'Design and engineering move together. Each piece is small enough to examine and real enough to learn from.',
    questions: ['Can you try it this week?', 'Does it hold up on real devices and data?', 'Is every decision written down?'],
    output: 'Working software you have already used',
  },
  {
    number: '4',
    verb: 'Learn',
    line: 'See what happens in use.',
    text: 'We check the result with the people who rely on it, tidy the handover and identify the next useful change.',
    questions: ['Is it being used the way we expected?', 'Can your team run and change it?', 'What should come next, if anything?'],
    output: 'A clean handover and a sensible next step',
  },
];
