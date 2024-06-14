export const TRAINING_DATA = {
  totalRuns: 776,
  totalMiles: 4216.91,
  weeks: [
    {
      startDate: '2024-04-28',
      totalMiles: 15,
    },
    {
      startDate: '2024-04-21',
      totalMiles: 10,
    },
    {
      startDate: '2024-04-14',
      totalMiles: 20,
    },
    {
      startDate: '2024-04-07',
      totalMiles: 22,
    },
    {
      startDate: '2024-03-31',
      totalMiles: 3.01,
    },
    {
      startDate: '2024-03-24',
      totalMiles: 25,
    },
    {
      startDate: '2024-03-17',
      totalMiles: 20,
    },
    {
      startDate: '2024-03-10',
      totalMiles: 15.97,
    },
    {
      startDate: '2024-03-03',
      totalMiles: 17.54,
    },
    {
      startDate: '2024-02-25',
      totalMiles: 9.89,
    },
  ],
  longRuns: [
    {
      date: '2023-11-05',
      time: '02:47:59',
      distance: 26.18,
    },
    {
      date: '2023-09-23',
      time: '02:49:02',
      distance: 20,
    },
  ],
};

export const RACE_INFO = {
  race: 'marathon',
  date: '2024-11-01T02:03:33.087Z',
  maxLongRun: '20',
};

export const TRAINING_PLAN_DOCUMENT = `
<document index="1">
<source>trainingplan.txt</source>
<document_content>{
  "novice": [
    {"week": 1, "total_miles": 15, "long_run": 6},
    {"week": 2, "total_miles": 16, "long_run": 7},
    {"week": 3, "total_miles": 15, "long_run": 5},
    {"week": 4, "total_miles": 19, "long_run": 9},
    {"week": 5, "total_miles": 21, "long_run": 10},
    {"week": 6, "total_miles": 18, "long_run": 7},
    {"week": 7, "total_miles": 24, "long_run": 12},
    {"week": 8, "total_miles": 19, "long_run": "Half Marathon"},
    {"week": 9, "total_miles": 24, "long_run": 10},
    {"week": 10, "total_miles": 29, "long_run": 15},
    {"week": 11, "total_miles": 32, "long_run": 16},
    {"week": 12, "total_miles": 29, "long_run": 12},
    {"week": 13, "total_miles": 36, "long_run": 18},
    {"week": 14, "total_miles": 33, "long_run": 14},
    {"week": 15, "total_miles": 40, "long_run": 20},
    {"week": 16, "total_miles": 29, "long_run": 12},
    {"week": 17, "total_miles": 21, "long_run": 8},
    {"week": 18, "total_miles": 12, "long_run": "Marathon"}
  ],
  "advanced": [
    {"week": 1, "total_miles": 26, "long_run": 10},
    {"week": 2, "total_miles": 29, "long_run": 11},
    {"week": 3, "total_miles": 23, "long_run": 8},
    {"week": 4, "total_miles": 31, "long_run": 13},
    {"week": 5, "total_miles": 34, "long_run": 14},
    {"week": 6, "total_miles": 30, "long_run": 10},
    {"week": 7, "total_miles": 40, "long_run": 16},
    {"week": 8, "total_miles": 41, "long_run": 17},
    {"week": 9, "total_miles": 23, "long_run": "Half Marathon"},
    {"week": 10, "total_miles": 46, "long_run": 19},
    {"week": 11, "total_miles": 50, "long_run": 20},
    {"week": 12, "total_miles": 36, "long_run": 12},
    {"week": 13, "total_miles": 49, "long_run": 20},
    {"week": 14, "total_miles": 37, "long_run": 12},
    {"week": 15, "total_miles": 52, "long_run": 20},
    {"week": 16, "total_miles": 39, "long_run": 12},
    {"week": 17, "total_miles": 26, "long_run": 8},
    {"week": 18, "total_miles": 14, "long_run": "Marathon"}
  ],
  "intermediate": [
    {"week": 1, "total_miles": 21, "long_run": 8},
    {"week": 2, "total_miles": 22, "long_run": 9},
    {"week": 3, "total_miles": 18, "long_run": 6},
    {"week": 4, "total_miles": 25, "long_run": 11},
    {"week": 5, "total_miles": 26, "long_run": 12},
    {"week": 6, "total_miles": 23, "long_run": 9},
    {"week": 7, "total_miles": 31, "long_run": 14},
    {"week": 8, "total_miles": 32, "long_run": 15},
    {"week": 9, "total_miles": 18, "long_run": "Half Marathon"},
    {"week": 10, "total_miles": 36, "long_run": 17},
    {"week": 11, "total_miles": 39, "long_run": 18},
    {"week": 12, "total_miles": 30, "long_run": 13},
    {"week": 13, "total_miles": 43, "long_run": 20},
    {"week": 14, "total_miles": 29, "long_run": 12},
    {"week": 15, "total_miles": 43, "long_run": 20},
    {"week": 16, "total_miles": 30, "long_run": 12},
    {"week": 17, "total_miles": 21, "long_run": 8},
    {"week": 18, "total_miles": 12, "long_run": "Marathon"}
  ]
}
</document_content>
</document>
`;

export const HALF_MARATHON_TRAINING_PLAN_DOCUMENT = `
<document index="1">
<source>half_marathon_training_plan.txt</source>
<document_content>{
  "novice": [
    {"week": 1, "total_miles": 12, "long_run": 4},
    {"week": 2, "total_miles": 12, "long_run": 4},
    {"week": 3, "total_miles": 14, "long_run": 5},
    {"week": 4, "total_miles": 14, "long_run": 5},
    {"week": 5, "total_miles": 16, "long_run": 6},
    {"week": 6, "total_miles": 16, "long_run": 6},
    {"week": 7, "total_miles": 18, "long_run": 7},
    {"week": 8, "total_miles": 18, "long_run": 8},
    {"week": 9, "total_miles": 20, "long_run": 8},
    {"week": 10, "total_miles": 22, "long_run": 9},
    {"week": 11, "total_miles": 22, "long_run": 10},
    {"week": 12, "total_miles": 18, "long_run": 10}
  ],
  "intermediate": [
    {"week": 1, "total_miles": 17, "long_run": 4},
    {"week": 2, "total_miles": 18, "long_run": 5},
    {"week": 3, "total_miles": 21, "long_run": 6},
    {"week": 4, "total_miles": 22, "long_run": 7},
    {"week": 5, "total_miles": 25, "long_run": 8},
    {"week": 6, "total_miles": 26, "long_run": 8},
    {"week": 7, "total_miles": 28, "long_run": 9},
    {"week": 8, "total_miles": 30, "long_run": 10},
    {"week": 9, "total_miles": 23, "long_run": 10},
    {"week": 10, "total_miles": 33, "long_run": 11},
    {"week": 11, "total_miles": 36, "long_run": 12},
    {"week": 12, "total_miles": 29, "long_run": 13}
  ],
  "advanced": [
    {"week": 1, "total_miles": 21, "long_run": 6},
    {"week": 2, "total_miles": 22, "long_run": 7},
    {"week": 3, "total_miles": 24, "long_run": 8},
    {"week": 4, "total_miles": 25, "long_run": 8},
    {"week": 5, "total_miles": 27, "long_run": 9},
    {"week": 6, "total_miles": 28, "long_run": 9},
    {"week": 7, "total_miles": 30, "long_run": 10},
    {"week": 8, "total_miles": 31, "long_run": 11},
    {"week": 9, "total_miles": 24, "long_run": 11},
    {"week": 10, "total_miles": 35, "long_run": 12},
    {"week": 11, "total_miles": 38, "long_run": 13},
    {"week": 12, "total_miles": 31, "long_run": 13}
  ]
}
</document_content>
</document>
`;
