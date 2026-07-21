/**
 * Nederlandse strings — eerste taal van de app. Rustige, warme toon; geen
 * juridische termen. Later uitbreidbaar naar meer talen.
 */

export const nl = {
  appName: 'Samen',
  schedule: {
    title: 'Schema',
    today: 'Vandaag',
    prevMonth: 'Vorige maand',
    nextMonth: 'Volgende maand',
    weekend: 'Weekend',
    weekdays: ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'],
    months: [
      'januari', 'februari', 'maart', 'april', 'mei', 'juni',
      'juli', 'augustus', 'september', 'oktober', 'november', 'december',
    ],
    handover: 'Overdracht',
    extraMoment: 'Extra contactmoment',
    unassigned: 'Nog niet ingedeeld',
    legendWeekday: 'Doordeweeks',
    legendWeekend: 'Weekend (om-en-om)',
  },
  day: {
    title: 'Dag',
    withParent: (name: string) => `Bij ${name}`,
    dayThenEvening: (day: string, evening: string) =>
      `Overdag ${day}, vanaf de avond ${evening}`,
    eveningOnly: (evening: string) => `Vanaf de avond bij ${evening}`,
    weekendBlock: 'Onderdeel van het weekend',
    overridden: 'Handmatig aangepast',
    back: 'Terug',
  },
  a11y: {
    dayCell: (date: string, who: string) => `${date}, ${who}`,
    starBadge: 'Extra contactmoment',
  },
} as const;

export type Strings = typeof nl;
