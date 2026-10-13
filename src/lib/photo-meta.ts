/**
 * Every event photo on the site: alt text and the focal point used when a
 * layout crops it (CSS object-position, "x% y%"). The image files live in
 * src/assets/photos/<name>.jpg, each downscaled with `npm run photo`.
 *
 * To add a photo: run `npm run photo -- "<original>" <name>`, then add an
 * entry here. Alt text says what the photo shows, plainly.
 */
export type PhotoMeta = { alt: string; focus: string };

export const PHOTO_META = {
  'barton-atrium-group': {
    alt: 'About 20 AI Club members stand in a row in the Koch Atrium of the Barton School of Business, under the Barton sign and the atrium stairs.',
    focus: '50% 62%',
  },
  'classroom-group': {
    alt: 'About 20 people pose at the front of a Wichita State classroom after an AI Club meeting.',
    focus: '50% 72%',
  },
  'chatterbox-demo': {
    alt: 'About two dozen people stand in front of two screens showing Chatterbox, a student-built language-learning app.',
    focus: '50% 60%',
  },
  'glass-wall-visit': {
    alt: 'Nine people stand in front of a wall of colorful blown-glass art during an AI Club industry visit.',
    focus: '50% 82%',
  },
  'lovable-workshop': {
    alt: 'Students on laptops in a lecture hall during the Lovable workshop, with the Lovable logo on both screens.',
    focus: '50% 56%',
  },
  'groover-labs-speaker': {
    alt: 'A speaker at a podium presents to rows of attendees at Groover Labs.',
    focus: '50% 58%',
  },
  'student-led-workshop': {
    alt: 'A student leads a workshop from the front of a classroom while members follow along on laptops.',
    focus: '50% 46%',
  },
  'chocolathon-opening': {
    alt: 'The Chocolathon opening in a Woolsey Hall lecture hall, with "Welcome to the Chocolathon" and the Cocoa Dolce and AI Club logos on the screen.',
    focus: '50% 52%',
  },
  'chocolathon-team-presenting': {
    alt: 'Four students present their Chocolathon project on stage, beside the Barton School of Business podium.',
    focus: '50% 42%',
  },
  'chocolathon-parameters-talk': {
    alt: 'A speaker presents a slide titled "How Parameters Learn?" to a lecture hall during the Chocolathon.',
    focus: '40% 50%',
  },
} as const satisfies Record<string, PhotoMeta>;

export type PhotoName = keyof typeof PHOTO_META;
export const PHOTO_NAMES = Object.keys(PHOTO_META) as PhotoName[];
