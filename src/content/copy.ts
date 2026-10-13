/**
 * Every line of copy on wsuaiclub.com that is not an event, a person, a link
 * or a number (those live in src/data/*.yaml). One file so the voice can be
 * read and approved in one place.
 *
 * Voice (brand guide): plainspoken, specific, a little dry. "We" is the club,
 * "you" is the reader. Lead with the verb or the outcome. Digits, not words.
 * Sentence-case headlines of 10 words or fewer, no exclamation marks, no
 * emoji, none of the banned words. `npm test` checks all of it.
 */
import type { PhotoName } from '../lib/photo-meta';

export type Format = { id: string; eyebrow: string; title: string; body: string; photo: PhotoName; href: string };

/** The five things the club runs. Used on Home, About and Events. */
export const formats: Format[] = [
  {
    id: 'workshops',
    eyebrow: 'Workshops',
    title: 'Build with the tools people use at work',
    body: 'Hands-on sessions where everyone builds along. Bring a laptop. No experience needed.',
    photo: 'lovable-workshop',
    href: '/events#upcoming',
  },
  {
    id: 'speakers',
    eyebrow: 'Industry speakers',
    title: 'People who deploy AI show how',
    body: 'People who use AI in their jobs walk through real work and take your questions.',
    photo: 'groover-labs-speaker',
    href: '/events#speakers',
  },
  {
    id: 'student-led',
    eyebrow: 'Student-led workshops',
    title: 'Members teach what they built',
    body: 'Members demo their own projects and show the room how they made them.',
    photo: 'chatterbox-demo',
    href: '/events#upcoming',
  },
  {
    id: 'community',
    eyebrow: 'Community events',
    title: 'Meet the people using AI in Wichita',
    body: 'Industry visits and joint events with partners on and off campus.',
    photo: 'glass-wall-visit',
    href: '/about#partnerships',
  },
  {
    id: 'hackathons',
    eyebrow: 'Hackathons',
    title: 'Build it, then pitch it',
    body: 'Teams take on real problems from partners, then build or pitch a solution.',
    photo: 'chocolathon-team-presenting',
    href: '/events#hackathons',
  },
];

export const copy = {
  brand: {
    name: 'AI Club at Wichita State',
    logoAlt: 'AI Club, Wichita State University',
    homeLabel: 'AI Club at Wichita State, home',
  },

  nav: {
    about: 'About Us',
    events: 'Events',
    team: 'Team',
    board: 'Advisory board',
    contact: 'Contact',
    join: 'Join',
    chocolathon: 'Chocolathon',
    menu: 'Menu',
    close: 'Close menu',
    primaryLabel: 'Main',
    skip: 'Skip to content',
  },

  nextMeeting: {
    eyebrow: 'Next meeting',
    event: 'Event',
    date: 'Date',
    time: 'Time',
    place: 'Place',
    details: 'Details on ShockerSync',
    empty: 'New dates post on ShockerSync',
    emptyLink: 'See ShockerSync',
  },

  home: {
    hero: {
      eyebrow: 'Wichita State · Student-led',
      headline: 'Hands-on AI at Wichita State',
      lede: 'A student-led club bridging the gap between industry and the classroom.',
      primary: 'Join AI Club',
      secondary: 'See events',
    },
    formats: {
      eyebrow: 'What we do',
      headline: 'Learn it, build it, argue about it',
      lede: 'Every week at Woolsey Hall, the AI Club brings a speaker, a workshop, or a build night. Every major and all community members are welcome.',
    },
    hackathons: {
      eyebrow: 'Hackathons',
      headline: 'Hackathons we run and join',
      lede: 'We host hackathons with partners and show up for the ones others run.',
    },
    partners: {
      eyebrow: 'Partners',
      headline: 'Thank you to our partners',
      lede: 'The schools, clubs and companies we worked with in 2026.',
    },
    team: {
      eyebrow: 'Team',
      headline: 'Run by students, backed by industry',
      cta: 'Meet the team',
    },
  },

  /** Tags on the Events list, by the `type` field in events.yaml. */
  eventTypes: {
    meeting: 'Weekly meeting',
    workshop: 'Workshop',
    speaker: 'Speaker',
    'build-night': 'Build night',
    hackathon: 'Hackathon',
    social: 'Social',
    tabling: 'Tabling',
    other: 'Event',
  } as Record<string, string>,

  newTab: '(opens in a new tab)',

  slideshow: {
    pause: 'Pause slideshow',
    play: 'Play slideshow',
    prev: 'Previous photo',
    next: 'Next photo',
    slide: 'Photo',
    of: 'of',
    home: 'Photos from AI Club meetings and events',
    about: 'Photos of AI Club members and guests',
    chocolathon: 'Photos from the Chocolathon',
  },

  hackathon: {
    hosted: 'Hosted',
    partner: 'Partner',
    cta: 'See the event',
    flyer: 'Open the full flyer',
  },

  joinBand: {
    eyebrow: 'Join',
    headline: 'Open to anyone curious about AI',
    lede: 'Students, faculty, alumni and the Wichita community are welcome. Bring a laptop. No experience needed.',
    primary: 'Join AI Club',
    secondary: 'Join the GroupMe',
  },

  about: {
    hero: {
      eyebrow: 'About us',
      headline: 'Where industry meets the classroom',
      lede: "AI Club is Wichita State's hands-on AI organization. We bring in the people deploying AI, teach members to use it, and host the hard conversations about it.",
    },
    why: {
      eyebrow: 'Why we exist',
      headline: 'Close the gap between class and work',
      body: [
        "Most of what you need to know about using AI at work isn't on a syllabus yet. So we bring in the people deploying it, run hands-on sessions with the tools they use, and leave time for the hard questions.",
        'Students of every major are welcome, and so are faculty, alumni, Wichita community members and anyone who wants to learn about AI.',
      ],
    },
    studentLed: {
      eyebrow: 'Student-led',
      headline: 'Students run it',
      body: [
        'Officers plan the calendar, and members lead workshops and discussions.',
        'A faculty advisor and an industry advisory board keep the club close to how AI is used at work.',
      ],
      cta: 'Meet the team',
      board: 'Meet the advisory board',
    },
    formats: {
      eyebrow: 'How we work',
      headline: 'Five ways to take part',
    },
    partnerships: {
      eyebrow: 'Partnerships',
      headline: 'Thank you to our partners',
      items: [
        {
          eyebrow: 'Cross-university and community',
          title: 'Newman University and Groover Labs',
          body: 'Thank you for our cross-university and community partnership this spring.',
        },
        {
          eyebrow: 'On-campus club',
          title: 'WSU Innovation Design',
          body: 'Thank you to the WSU Innovation Design student organization for partnering with us.',
        },
        {
          eyebrow: 'Sponsored event',
          title: 'Lovable',
          body: "Thank you to Lovable for sponsoring a workshop, Michael Goldberg's first event as a Lovable Campus Leader at WSU.",
        },
        {
          eyebrow: 'Chocolathon partner',
          title: 'Cocoa Dolce',
          body: 'Thank you to Cocoa Dolce for the problems, the judges and the chocolate at the Chocolathon.',
        },
      ],
    },
    advisor: {
      eyebrow: 'Faculty advisor',
      headline: 'Our faculty advisor',
    },
    teamCta: {
      eyebrow: 'Team',
      headline: 'Meet the people who run it',
      cta: 'Meet the team',
    },
  },

  events: {
    hero: {
      eyebrow: 'Events · Fall 2026',
      headline: 'Weekly meetings at Woolsey Hall',
      lede: 'Students, faculty, alumni and the Wichita community are welcome. Each event lists its own date, time and place.',
      primary: 'Join AI Club',
      secondary: 'All dates on ShockerSync',
    },
    upcoming: {
      eyebrow: 'Upcoming',
      headline: 'On the calendar',
      lede: "RSVP links go to ShockerSync or to the event's own form.",
      rsvp: 'RSVP',
      details: 'Details',
      ledBy: 'Led by',
      with: 'With',
      flyer: 'Flyer',
      openFlyer: 'Open the full flyer',
    },
    formats: {
      eyebrow: 'What we run',
      headline: 'Five kinds of events',
    },
    hackathons: {
      eyebrow: 'Hackathons',
      headline: 'Hackathons we ran and joined',
    },
    speakers: {
      eyebrow: 'Past speakers',
      headline: 'Who has spoken at AI Club',
      lede: 'Thank you to everyone who has spoken to the club.',
    },
    gallery: {
      eyebrow: 'Photos',
      headline: 'From recent meetings and events',
      captions: {
        'chocolathon-parameters-talk': 'Chocolathon · Speaker session',
        'lovable-workshop': 'Lovable workshop',
        'chatterbox-demo': 'Chatterbox demo',
        'groover-labs-speaker': 'Speaker at Groover Labs',
        'glass-wall-visit': 'Industry visit',
        'chocolathon-opening': 'Chocolathon · Opening',
        'student-led-workshop': 'Student-led workshop',
        'barton-atrium-group': 'Koch Atrium, Barton School',
      } as Partial<Record<PhotoName, string>>,
    },
  },

  board: {
    hero: {
      eyebrow: 'Industry advisory board',
      headline: 'The people who keep us close to industry',
      lede: 'Professionals who use AI at work. They connect the club to industry and help close the gap between the classroom and real work.',
    },
    linkedin: 'LinkedIn',
    homeStrip: {
      eyebrow: 'Industry advisory board',
      line: 'Professionals who connect the club to industry.',
      cta: 'Meet the advisory board',
    },
    teamLink: 'Meet the advisory board',
    contact: {
      eyebrow: 'Work with us',
      headline: 'Bring your work into the room',
      lede: 'Speak at a meeting, judge a hackathon or bring a project to our members.',
      cta: 'Contact the officers',
    },
  },

  team: {
    hero: {
      eyebrow: 'Team',
      headline: 'The people behind AI Club',
      lede: 'Students run the club. A faculty advisor and an industry advisory board back them up.',
    },
    linkedin: 'LinkedIn',
  },

  contact: {
    hero: {
      eyebrow: 'Contact',
      headline: 'Talk to the officers',
      lede: 'Email reaches the whole leadership team. Pick a subject below, or write to us directly.',
    },
    email: {
      label: 'Email',
      copy: 'Copy address',
      copied: 'Copied',
    },
    topics: {
      eyebrow: 'Subjects',
      headline: 'Pick the closest subject',
      subjectLabel: 'Subject',
      items: [
        {
          title: 'Consulting and projects',
          body: 'Have a problem AI could help with? Our members take on paid consulting and project work. Tell us what you need.',
          subject: 'Consulting project inquiry',
        },
        {
          title: 'Speak at a meeting',
          body: 'Show members how you use AI at work, then take their questions.',
          subject: 'Speaking at AI Club',
        },
        {
          title: 'Partner on an event',
          body: 'Co-host a workshop, a visit or a joint meeting with your club, class or company.',
          subject: 'Event partnership',
        },
        {
          title: 'Sponsor a hackathon',
          body: 'Bring a real problem, judges or prizes to our next hackathon.',
          subject: 'Hackathon sponsorship',
        },
        {
          title: 'Everything else',
          body: 'Questions, press, or something we did not think of.',
          subject: 'Hello from the website',
        },
      ],
    },
    where: {
      eyebrow: 'Where we meet',
      headline: 'The weekly meeting',
      day: 'Day',
      time: 'Time',
      place: 'Place',
      note: 'This is the usual weekly meeting. Other events happen on other days, around campus and Wichita, and each one lists its own time and place on the Events page and ShockerSync.',
      cta: 'See events',
    },
    social: {
      eyebrow: 'Follow',
      headline: 'Find us online',
      instagram: { title: 'Instagram', body: 'Photos and event posts', handle: '@wsuaiclub' },
      linkedin: { title: 'LinkedIn', body: 'Speakers, partners and club news', handle: 'WSU AI Club' },
      groupme: { title: 'GroupMe', body: 'Meeting reminders and quick updates', handle: 'AI Club' },
    },
  },

  join: {
    hero: {
      eyebrow: 'Join',
      headline: 'Pick your way in',
      lede: 'AI Club is for students, faculty, alumni, Wichita community members and anyone who wants to learn about AI. Use one of these or all five.',
    },
    channels: {
      shockersync: { eyebrow: 'Membership', title: 'ShockerSync', body: 'Official membership for WSU students.', cta: 'Join on ShockerSync' },
      groupme: { eyebrow: 'Group chat', title: 'GroupMe', body: 'Meeting reminders and quick updates.', cta: 'Join the GroupMe' },
      email: { eyebrow: 'Email', title: 'Email list', body: 'Event announcements in your inbox.', cta: 'Sign up' },
      instagram: { eyebrow: 'Social', title: 'Instagram', body: 'Photos and event posts.', cta: 'Follow @wsuaiclub' },
      linkedin: { eyebrow: 'Social', title: 'LinkedIn', body: 'Speakers, partners and club news.', cta: 'Follow the club' },
    },
    paths: {
      eyebrow: 'Who it is for',
      headline: 'Find your path',
      students: {
        eyebrow: 'Students · Start here',
        title: 'Become a member',
        body: 'Join on ShockerSync to become an official member, then join the GroupMe for reminders. Come to any meeting. No experience needed.',
        primary: 'Join on ShockerSync',
        secondary: 'Join the GroupMe',
      },
      everyone: {
        eyebrow: 'Faculty, alumni and community',
        title: 'No membership needed',
        body: 'Join the email list and the GroupMe, follow us on Instagram and LinkedIn, and come to any event. You do not need ShockerSync.',
        primary: 'Join the email list',
        secondary: 'See events',
        contact: 'Want to speak, partner or sponsor? Contact the officers',
      },
    },
  },

  notFound: {
    eyebrow: 'Error 404',
    headline: 'This page is not here',
    lede: 'It may have moved when we rebuilt the site. Try one of these.',
    chocolathon: 'Looking for the Chocolathon?',
  },

  footer: {
    tagline: 'Hands-on AI at Wichita State',
    site: 'Site',
    follow: 'Follow',
    contact: 'Contact',
    copyright: 'AI Club at Wichita State University',
  },

  meta: {
    home: {
      title: 'AI Club | Hands-on AI at Wichita State',
      description: "AI Club is Wichita State's hands-on AI organization. We bring in the people deploying AI, teach members to use it, and host the hard conversations about it.",
    },
    about: {
      title: 'About Us | AI Club at Wichita State',
      description: 'A student-led club bridging the gap between industry and the classroom: how we work, our partners and our faculty advisor.',
    },
    events: {
      title: 'Events | AI Club at Wichita State',
      description: 'Weekly meetings at Woolsey Hall, plus workshops, speakers and hackathons around campus and Wichita. Upcoming dates, past speakers and photos.',
    },
    team: {
      title: 'Team | AI Club at Wichita State',
      description: 'The student officers, faculty advisor and industry advisory board behind AI Club at Wichita State.',
    },
    contact: {
      title: 'Contact | AI Club at Wichita State',
      description: 'Email aiclub@wichita.edu about consulting projects, speaking at a meeting, partnering on an event or sponsoring a hackathon.',
    },
    join: {
      title: 'Join | AI Club at Wichita State',
      description: 'Join AI Club on ShockerSync, GroupMe or the email list. Open to students, faculty, alumni and the Wichita community. No experience needed.',
    },
    board: {
      title: 'Industry Advisory Board | AI Club at Wichita State',
      description: 'The professionals who connect AI Club at Wichita State to industry, from Koch, Cargill, Boeing, Unified, Moonbase Labs and more.',
    },
    notFound: {
      title: 'Page not found | AI Club at Wichita State',
      description: 'This page is not on wsuaiclub.com.',
    },
  },
};
