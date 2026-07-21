import type { Profile, ScheduleOverride, ScheduleRule } from '@/data/types';
import { assignmentFor } from './engine';

const parentA: Profile = {
  id: 'pa',
  householdId: 'hh',
  displayName: 'Ouder A',
  role: 'parent_a',
  color: '#2F8F83',
  isOwner: true,
  createdAt: '',
};
const parentB: Profile = {
  id: 'pb',
  householdId: 'hh',
  displayName: 'Ouder B',
  role: 'parent_b',
  color: '#C9703B',
  isOwner: false,
  createdAt: '',
};
const parents = [parentA, parentB];

// ma+di -> A, wo+do -> B (zoals in de opdracht). Vrijdag bewust niet toegewezen:
// die valt onder de weekendovergang.
const rule: ScheduleRule = {
  id: 'r1',
  householdId: 'hh',
  activeFrom: '2026-01-01',
  weekdayAssignment: { 1: 'pa', 2: 'pa', 3: 'pb', 4: 'pb' },
  weekendEnabled: true,
  weekendDays: [5, 6, 7],
  fridayHandover: true,
  weekendAnchorDate: '2026-07-25', // een zaterdag; dit weekend heeft ouder A
  weekendAnchorParent: 'pa',
};

const no: ScheduleOverride[] = [];

describe('doordeweekse toewijzing', () => {
  it('maandag -> ouder A', () => {
    const a = assignmentFor('2026-07-20', rule, no, parents);
    expect(a.parentId).toBe('pa');
    expect(a.isWeekend).toBe(false);
    expect(a.handover).toBeUndefined();
  });

  it('woensdag -> ouder B', () => {
    expect(assignmentFor('2026-07-22', rule, no, parents).parentId).toBe('pb');
  });

  it('donderdag -> ouder B', () => {
    expect(assignmentFor('2026-07-23', rule, no, parents).parentId).toBe('pb');
  });
});

describe('weekendrotatie (om-en-om)', () => {
  it('ankerweekend (za) -> ankerouder A', () => {
    const a = assignmentFor('2026-07-25', rule, no, parents);
    expect(a.parentId).toBe('pa');
    expect(a.isWeekend).toBe(true);
  });

  it('zondag hoort bij dezelfde weekendouder als de zaterdag', () => {
    expect(assignmentFor('2026-07-26', rule, no, parents).parentId).toBe('pa');
  });

  it('volgend weekend wisselt naar B', () => {
    expect(assignmentFor('2026-08-01', rule, no, parents).parentId).toBe('pb');
  });

  it('daarop volgend weekend weer A', () => {
    expect(assignmentFor('2026-08-08', rule, no, parents).parentId).toBe('pa');
  });

  it('weekend vóór het anker wisselt de andere kant op naar B', () => {
    expect(assignmentFor('2026-07-18', rule, no, parents).parentId).toBe('pb');
  });
});

describe('vrijdag als overdrachtsdag', () => {
  it('vrijdag: overdag onbepaald, avond = weekendouder A', () => {
    const a = assignmentFor('2026-07-24', rule, no, parents);
    expect(a.isWeekend).toBe(true);
    expect(a.parentId).toBe('pa'); // de nacht telt als weekendouder
    expect(a.handover).toEqual({ dayParentId: null, eveningParentId: 'pa' });
  });

  it('vrijdag voor het B-weekend: avond = B', () => {
    const a = assignmentFor('2026-07-31', rule, no, parents);
    expect(a.handover?.eveningParentId).toBe('pb');
  });
});

describe('overrides winnen van de regel', () => {
  it('expliciete toewijzing overschrijft de dag en heft overdracht op', () => {
    const overrides: ScheduleOverride[] = [
      {
        id: 'o1',
        householdId: 'hh',
        date: '2026-07-24', // normaal weekendovergang naar A
        assignedTo: 'pb',
        isStar: false,
        createdBy: 'pa',
        createdAt: '',
      },
    ];
    const a = assignmentFor('2026-07-24', rule, overrides, parents);
    expect(a.parentId).toBe('pb');
    expect(a.overridden).toBe(true);
    expect(a.handover).toBeUndefined();
  });

  it('ster zonder herverdeling laat de ouder staan maar markeert de dag', () => {
    const overrides: ScheduleOverride[] = [
      {
        id: 'o2',
        householdId: 'hh',
        date: '2026-07-23', // donderdag = B
        assignedTo: null,
        isStar: true,
        createdBy: 'pa',
        createdAt: '',
      },
    ];
    const a = assignmentFor('2026-07-23', rule, overrides, parents);
    expect(a.parentId).toBe('pb');
    expect(a.isStar).toBe(true);
    expect(a.overridden).toBe(true);
  });
});
