import {
  sortDataByField,
  reviewedWithin24hrs,
  getDeadline,
} from '../src/utils/reportUtils';
import moment from 'moment';

import { describe, it, expect } from '@jest/globals';

const data = [
  {
    created_at: '2022-07-06 5:25:43 PM',
    updated_at: '2022-07-13 11:52:09 AM',
    state: 'open',
    user: 'chetan-mudireddy-simplisafe',
    title: 'Air 435 update pkg model',
    html_url: 'https://github.com/simplisafe/aiengine/pull/31',
    requested_teams: [],
    requested_reviewers: [],
  },
  {
    created_at: '2023-06-16 2:34:17 PM',
    updated_at: '2023-06-16 2:34:17 PM',
    state: 'open',
    user: 'odutola-oduyoye-simplisafe',
    title: 'MED-946/cortex feature flag',
    html_url: 'https://github.com/simplisafe/bender/pull/143',
    requested_teams: ['camfam'],
    requested_reviewers: [],
  },
  {
    created_at: '2023-05-23 10:58:11 AM',
    updated_at: '2023-05-23 10:58:12 AM',
    state: 'open',
    user: 'dean-wetherby-simplisafe',
    title: 'Updating vulnerable packages',
    html_url: 'https://github.com/simplisafe/cranium/pull/128',
    requested_teams: ['camfam', 'cloud-ai'],
    requested_reviewers: [],
  },
  {
    created_at: '2023-06-14 4:42:41 PM',
    updated_at: '2023-06-14 4:42:42 PM',
    state: 'open',
    user: 'alan-willard-simplisafe',
    title:
      'feat(MED-784): Adding ARM base images for use on apple M1  hardware',
    html_url: 'https://github.com/simplisafe/infra-mist/pull/11',
    requested_teams: ['camfam'],
    requested_reviewers: ['justin-forrest-simplisafe'],
  },
  {
    created_at: '2023-03-28 9:48:54 AM',
    updated_at: '2023-03-28 9:48:54 AM',
    state: 'open',
    user: 'justin-forrest-simplisafe',
    title: 'Feature one main',
    html_url: 'https://github.com/simplisafe/interview-camera-record/pull/1',
    requested_teams: [],
    requested_reviewers: [],
  },
  {
    created_at: '2023-04-10 3:21:39 PM',
    updated_at: '2023-04-24 9:33:04 AM',
    state: 'open',
    user: 'odutola-oduyoye-simplisafe',
    title: 'feat(MED-791) Subscription Change Plan Feature',
    html_url: 'https://github.com/simplisafe/leia/pull/1356',
    requested_teams: ['camfam', 'siren'],
    requested_reviewers: [],
  },
  {
    created_at: '2023-06-15 10:51:16 AM',
    updated_at: '2023-06-16 8:41:02 PM',
    state: 'open',
    user: 'alan-willard-simplisafe',
    title: 'feat(MED-784): Adds Gstreamer and Pipeline management',
    html_url: 'https://github.com/simplisafe/streamer-net/pull/28',
    requested_teams: [],
    requested_reviewers: [],
  },
  {
    created_at: '2023-02-08 1:22:10 PM',
    updated_at: '2023-02-08 1:22:10 PM',
    state: 'open',
    user: 'manet-mau-simplisafe',
    title: 'feat(med-606): enabled deploys, removed superadmin role',
    html_url: 'https://github.com/simplisafe/tf-bender/pull/11',
    requested_teams: [],
    requested_reviewers: [],
  },
];

describe('Report utils tests', () => {
  it('Should correctly sort data', () => {
    const field = 'created_at';
    const result = sortDataByField(data, field, 'asc');
    const want = [
      '2022-07-06 5:25:43 PM',
      '2023-02-08 1:22:10 PM',
      '2023-03-28 9:48:54 AM',
      '2023-04-10 3:21:39 PM',
      '2023-05-23 10:58:11 AM',
      '2023-06-14 4:42:41 PM',
      '2023-06-15 10:51:16 AM',
      '2023-06-16 2:34:17 PM',
    ];

    const resultDates = result.map((r) => r[field]);

    expect(resultDates).toEqual(want);
  });

  it('Should correctly check if PRs are review within 24 hours', () => {
    const today = moment('2023-06-24T00:00:00Z');
    const testCases = [
      {
        reviewRequests: [],
        reviews: [],
        currentDateTime: moment('2023-06-16T20:48:08Z'),
        want: '',
      },
      {
        reviewRequests: [
          {
            created_at: '2023-06-13T21:26:05Z',
          },
          {
            created_at: '2023-06-15T12:55:36Z',
          },
        ],
        reviews: [
          {
            state: 'PENDING',
          },
          {
            state: 'COMMENTED',
            submitted_at: '2023-06-14T17:48:08Z',
          },
          {
            state: 'COMMENTED',
            submitted_at: '2023-06-16T17:48:08Z',
          },
        ],
        currentDateTime: moment('2023-06-16T20:48:08Z'),
        want: false,
      },
      {
        reviewRequests: [
          {
            event: 'review_requested',
            created_at: '2023-06-13T21:26:05Z',
          },
        ],
        reviews: [
          {
            user: {
              login: 'phuongnhat-nguyen-simplisafe',
            },
            state: 'PENDING',
          },
        ],
        currentDateTime: moment('2023-06-13T22:48:08Z'),
        want: '',
      },
      {
        reviewRequests: [
          {
            event: 'review_requested',
            created_at: '2023-06-13T21:26:05Z',
          },
        ],
        reviews: [],
        currentDateTime: today,
        want: false,
      },
      {
        reviewRequests: [
          {
            event: 'review_requested',
            created_at: '2023-06-13T21:26:05Z',
          },
        ],
        reviews: [],
        currentDateTime: moment('2023-06-13T22:26:05Z'),
        want: '',
      },
      {
        reviewRequests: [
          {
            created_at: '2023-06-14T21:33:27Z',
            requestedReviewer: {
              name: 'camfam',
            },
          },
        ],
        reviews: [
          {
            submitted_at: '2023-06-15T13:14:46Z',
            state: 'APPROVED',
          },
        ],
        currentDateTime: today,
        want: true,
      },
      {
        reviewRequests: [
          {
            created_at: '2023-06-22T14:48:17Z',
            requestedReviewer: {
              name: 'camfam',
            },
          },
        ],
        reviews: [
          {
            submitted_at: '2023-06-22T15:35:20Z',
            state: 'COMMENTED',
          },
          {
            submitted_at: '2023-06-22T18:44:01Z',
            state: 'COMMENTED',
          },
          {
            submitted_at: '2023-06-22T18:51:20Z',
            state: 'COMMENTED',
          },
          {
            submitted_at: '2023-06-23T15:08:03Z',
            state: 'COMMENTED',
          },
          {
            submitted_at: '2023-06-23T15:08:22Z',
            state: 'COMMENTED',
          },
          {
            submitted_at: '2023-06-23T15:08:29Z',
            state: 'COMMENTED',
          },
          {
            submitted_at: '2023-06-23T15:08:37Z',
            state: 'COMMENTED',
          },
        ],
        currentDateTime: today,
        want: true,
      },
      {
        reviewRequests: [
          {
            created_at: '2023-06-22T13:33:37Z',
            requestedReviewer: {
              name: 'camfam',
            },
          },
          {
            created_at: '2023-06-22T13:33:37Z',
            requestedReviewer: {
              name: 'cloud-ai',
            },
          },
        ],
        reviews: [
          {
            submitted_at: '2023-06-22T14:04:21Z',
            state: 'APPROVED',
          },
        ],
        currentDateTime: today,
        want: true,
      },
      {
        reviewRequests: [
          {
            created_at: '2023-06-15T17:10:03Z',
            requestedReviewer: {
              name: 'camfam',
            },
          },
        ],
        reviews: [
          {
            submitted_at: '2023-06-16T19:42:55Z',
            state: 'COMMENTED',
          },
          {
            submitted_at: '2023-06-20T13:41:00Z',
            state: 'COMMENTED',
          },
          {
            submitted_at: '2023-06-20T13:41:12Z',
            state: 'COMMENTED',
          },
          {
            submitted_at: '2023-06-20T13:43:51Z',
            state: 'COMMENTED',
          },
          {
            submitted_at: '2023-06-20T13:44:29Z',
            state: 'COMMENTED',
          },
          {
            submitted_at: '2023-06-20T19:43:21Z',
            state: 'APPROVED',
          },
        ],
        currentDateTime: today,
        want: false,
      },
      // Falls on a weekend
      {
        reviewRequests: [
          {
            created_at: '2023-06-23T20:28:20Z',
            requestedReviewer: {
              name: 'camfam',
            },
          },
        ],
        reviews: [],
        currentDateTime: moment('2023-06-26T00:28:20Z'),
        want: '',
      },
      // Falls on a weekend
      {
        reviewRequests: [
          {
            created_at: '2023-06-23T20:28:20Z',
            requestedReviewer: {
              name: 'camfam',
            },
          },
        ],
        reviews: [],
        currentDateTime: moment('2023-06-27T00:28:20Z'),
        want: false,
      },
    ];

    for (const [index, testCase] of Object.entries(testCases)) {
      const { reviewRequests, reviews, currentDateTime, want } = testCase;

      const result = reviewedWithin24hrs(
        reviewRequests,
        reviews,
        currentDateTime
      );

      if (result !== want) {
        console.log(`Test case at index ${index} failed.`);
      }

      expect(result).toEqual(want);
    }
  });

  it('Should correctly get the deadline date', () => {
    const testCases = [
      // handle weekend
      {
        date: '2023-06-23T20:28:20Z',
        want: '2023-06-26T20:28:20Z',
      },
      // handle holidays
      {
        date: '2023-06-16T22:00:00Z',
        want: '2023-06-20T22:00:00Z',
      },
      {
        date: '2023-07-03T22:00:00Z',
        want: '2023-07-05T22:00:00Z',
      },
    ];

    for (const testCase of testCases) {
      const { date, want } = testCase;

      const result = getDeadline(date).toISOString();
      expect(result).toEqual(moment(want).toISOString());
    }
  });
});
