// The exact wording readers see on the email sign-up forms. Each sign-up stores the version, the boxes
// ticked and this wording, so there is a record of what every subscriber agreed to.
// If you change the wording, change it in js/site.js (JOIN_LISTS) too and give it a new version.
// (The "newsletter" list is, for now, the general RoadStar list: more about the site, the company and how to stay involved.)
export const CONSENT_VERSION = '2026-11-14.2';
export const LISTS = {
  newsletter: 'More about RoadStar: the site, the company, and how to stay involved',
  accounts: 'News about reader accounts',
  games: 'RoadStar emails about games and new stories',
};
export const CONSENT_STATEMENT = 'RoadStar Media (roadstarjournal.com, roadstarjournal@gmail.com) will email you only about what you tick. You can unsubscribe at any time, and every email will include a way to do it.';
