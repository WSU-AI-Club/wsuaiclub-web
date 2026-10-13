/**
 * All copy and links for wsuaiclub.com live in this file. Officers can edit it
 * without touching components. An empty field renders nothing on the site.
 *
 * STILL EMPTY (the club has not supplied these yet):
 *   - joinFormUrl         student Join CTA falls back to LinkedIn
 *   - contactEmail        faculty and community paths fall back to LinkedIn
 *   - instagramUrl        footer link hidden
 *   - discordUrl          footer link hidden
 *   - nextSession         date, time, room: data strip hidden
 *   - officers            nothing rendered
 *   - codeOfConductUrl    footer link hidden
 *
 * Copy rules (brand guide): sentence-case headlines of 10 words or fewer, no
 * exclamation marks, no emoji, no banned words. `npm test` enforces them.
 */

export type DataCell = { label: string; value: string };
export type Officer = { name: string; role: string };

export const site = {
  // Links (empty = hidden or falls back)
  joinFormUrl: '',
  contactEmail: '',
  linkedinUrl: 'https://www.linkedin.com/company/wsu-ai-club',
  instagramUrl: '',
  discordUrl: '',
  codeOfConductUrl: '',
  nextSession: { date: '', time: '', room: '' },
  officers: [] as Officer[],

  nav: {
    what: 'What we do',
    chocolathon: 'Chocolathon',
    join: 'Join',
    logoAlt: 'AI Club at Wichita State',
  },

  hero: {
    eyebrow: 'Wichita State · AI Club',
    headline: 'Hands-on AI at Wichita State.',
    lede: 'AI Club at Wichita State is where students go hands-on with AI. People who deploy it for a living show us how, members build with it, and everyone argues about it in the open.',
    primary: 'Join AI Club',
    secondary: 'What we do',
    stageLabel: 'AI Club emblem. Move your pointer across it to stir the pieces.',
    instruction: 'Move slowly. Then make some wind.',
    instructionReduced: 'The emblem is still. Reduced motion is on.',
    gust: 'Send a gust',
    gustReduced: 'Reduced motion',
    pause: 'Pause sculpture motion',
    resume: 'Resume sculpture motion',
    windLive: 'Live wind',
    windPaused: 'Paused',
    windStill: 'Still mode',
    loading: 'Loading the emblem',
  },

  what: {
    id: 'what',
    eyebrow: 'What we do',
    headline: 'Learn it, build it, argue about it',
    lede: "AI Club is Wichita State's hands-on AI organization. We bring in the people deploying AI, teach members to use it, and host the hard conversations about it.",
    rows: [
      {
        eyebrow: 'Speaker Series',
        title: 'People who deploy AI show how',
        body: 'People who use AI in their work come in and show how they do it. You ask the questions.',
        ground: 'paper',
      },
      {
        eyebrow: 'Workflow Sessions · Build nights',
        title: 'Members build with real tools',
        body: 'We work with the tools people use today, like ChatGPT, Claude, Cursor and n8n. Bring a laptop. No experience needed.',
        ground: 'ink',
      },
      {
        eyebrow: 'Open Floor',
        title: 'We host the argument',
        body: "The hard conversations about AI happen in the open. We host the argument; we don't pick the side.",
        ground: 'paper',
      },
    ],
  },

  nextSessionStrip: {
    eyebrow: 'Next session',
    dateLabel: 'Date',
    timeLabel: 'Time',
    roomLabel: 'Room',
  },

  chocolathon: {
    eyebrow: 'Recap · Chocolathon',
    headline: 'We ran a chocolate hackathon with Cocoa Dolce',
    body: 'Two tracks, Build and Pitch, in one room at Woolsey Hall. The gallery holds the projects.',
    data: [
      { label: 'Date', value: 'Sep 19, 2026' },
      { label: 'Place', value: 'Woolsey Hall, WSU' },
      { label: 'Tracks', value: 'Build · Pitch' },
      { label: 'Gallery', value: '17 projects' },
    ] as DataCell[],
    link: 'See the event',
    credit: "Thanks to Cocoa Dolce, Lovable, Jimmy John's, Red Bull, DTMedia and the AI Prompt Championship.",
  },

  joinBand: {
    eyebrow: 'Join · AI Club',
    headline: 'Every major is welcome',
    body: 'Bring a laptop. No experience needed.',
    cta: 'Join AI Club',
  },

  joinPage: {
    eyebrow: 'Join · AI Club',
    headline: 'Pick your way in',
    lede: 'Students, faculty and people from the community each have a way in.',
    paths: {
      students: {
        eyebrow: 'Students',
        title: 'Join as a student',
        body: 'Bring a laptop. No experience needed.',
        cta: 'Join AI Club',
        ctaFallback: 'Follow AI Club on LinkedIn',
      },
      faculty: {
        eyebrow: 'Faculty',
        title: 'Speak, co-host or advise',
        body: 'Speak at a session, co-host one, or advise a member project.',
        cta: 'Email the club',
        ctaFallback: 'Message us on LinkedIn',
      },
      community: {
        eyebrow: 'Community and industry',
        title: 'Speak, mentor or partner',
        body: 'Speak at a session, mentor members, or partner on an event.',
        cta: 'Email the club',
        ctaFallback: 'Message us on LinkedIn',
      },
    },
  },

  footer: {
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    discord: 'Discord',
    email: 'Email',
    conduct: 'Code of Conduct',
    credit: 'Emblem modeled in Blender, animated with three.js.',
    copyright: 'AI Club at Wichita State',
  },

  meta: {
    home: {
      title: 'AI Club at Wichita State | Hands-on AI at Wichita State',
      description: "AI Club is Wichita State's hands-on AI organization. We bring in the people deploying AI, teach members to use it, and host the hard conversations about it.",
    },
    join: {
      title: 'Join AI Club | AI Club at Wichita State',
      description: 'Join AI Club at Wichita State as a student, faculty member or community partner. Bring a laptop. No experience needed.',
    },
  },
};

export type Site = typeof site;
