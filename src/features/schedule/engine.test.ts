import type { Profile, ScheduleOverride, ScheduleRule } from '@/data/types';
import { assignmentFor, nextSwitch } from './engine';

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

describe('afwijking-vlag', () => {
  it('een dag zonder override wijkt niet af', () => {
    expect(assignmentFor('2026-07-20', rule, no, parents).deviation).toBe(false);
  });

  it('een override met alleen een reden telt niet als afwijking', () => {
    const overrides: ScheduleOverride[] = [
      {
        id: 'o', householdId: 'hh', date: '2026-07-20', assignedTo: null,
        isStar: false, reason: 'ter info', createdBy: 'pa', createdAt: '',
      },
    ];
    expect(assignmentFor('2026-07-20', rule, overrides, parents).deviation).toBe(false);
  });

  it('een herverdeling telt als afwijking', () => {
    const overrides: ScheduleOverride[] = [
      {
        id: 'o', householdId: 'hh', date: '2026-07-20', assignedTo: 'pb',
        isStar: false, createdBy: 'pa', createdAt: '',
      },
    ];
    expect(assignmentFor('2026-07-20', rule, overrides, parents).deviation).toBe(true);
  });
});

describe('per-kind indeling', () => {
  it('deelt één kind anders in en markeert de dag als afwijking', () => {
    const overrides: ScheduleOverride[] = [
      {
        id: 'o', householdId: 'hh', date: '2026-07-20', assignedTo: null,
        childAssignments: [{ childId: 'kind-1', parentId: 'pb' }],
        isStar: false, createdBy: 'pa', createdAt: '',
      },
    ];
    const a = assignmentFor('2026-07-20', rule, overrides, parents);
    expect(a.parentId).toBe('pa'); // hoofd-ouder blijft de regel
    expect(a.childAssignments).toEqual([{ childId: 'kind-1', parentId: 'pb' }]);
    expect(a.deviation).toBe(true);
  });
});

describe('extra eetmoment', () => {
  it('markeert een extra eetmoment bij de andere ouder in een weekend', () => {
    // 2026-07-26 (zondag) is een A-weekend; extra eten bij B.
    const overrides: ScheduleOverride[] = [
      {
        id: 'o', householdId: 'hh', date: '2026-07-26', assignedTo: null,
        extraMealParentId: 'pb', isStar: false, createdBy: 'pa', createdAt: '',
      },
    ];
    const a = assignmentFor('2026-07-26', rule, overrides, parents);
    expect(a.parentId).toBe('pa'); // blijft bij de weekendouder
    expect(a.extraMealParentId).toBe('pb');
    expect(a.deviation).toBe(true);
  });
});

describe('volgende wissel', () => {
  it('vindt de eerstvolgende dag waarop de ouder wisselt', () => {
    // di 21 juli = A (weekdag). wo 22 juli = B. Dus de wissel is 22 juli.
    const s = nextSwitch('2026-07-21', rule, no, parents);
    expect(s?.date).toBe('2026-07-22');
    expect(s?.parentId).toBe('pb');
  });
});
