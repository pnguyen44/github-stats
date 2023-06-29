import {
  sortDataByField,
  reviewedWithin24hrs,
  getDeadline,
  bucketDataByInterval,
  isValidDateFormat,
} from '../src/utils/reportUtils';
import moment from 'moment';

import { describe, it, expect } from '@jest/globals';

describe('Report utils tests', () => {
  it('Should correctly sort data', () => {
    const field = 'created_at';
    const data = [
      {
        created_at: '2022-07-06 5:25:43 PM',
        updated_at: '2022-07-13 11:52:09 AM',
        state: 'open',
        requested_teams: [],
        requested_reviewers: [],
      },
      {
        created_at: '2023-06-16 2:34:17 PM',
        updated_at: '2023-06-16 2:34:17 PM',
        state: 'open',
        requested_teams: ['camfam'],
        requested_reviewers: [],
      },
      {
        created_at: '2023-05-23 10:58:11 AM',
        updated_at: '2023-05-23 10:58:12 AM',
        state: 'open',
        requested_teams: ['camfam', 'cloud-ai'],
        requested_reviewers: [],
      },
      {
        created_at: '2023-06-14 4:42:41 PM',
        updated_at: '2023-06-14 4:42:42 PM',
        state: 'open',
        requested_teams: ['camfam'],
        requested_reviewers: ['justin-forrest-simplisafe'],
      },
      {
        created_at: '2023-03-28 9:48:54 AM',
        updated_at: '2023-03-28 9:48:54 AM',
        state: 'open',
        requested_teams: [],
        requested_reviewers: [],
      },
      {
        created_at: '2023-04-10 3:21:39 PM',
        updated_at: '2023-04-24 9:33:04 AM',
        state: 'open',
        requested_teams: ['camfam', 'siren'],
        requested_reviewers: [],
      },
      {
        created_at: '2023-06-15 10:51:16 AM',
        updated_at: '2023-06-16 8:41:02 PM',
        state: 'open',
        requested_teams: [],
        requested_reviewers: [],
      },
      {
        created_at: '2023-02-08 1:22:10 PM',
        updated_at: '2023-02-08 1:22:10 PM',
        state: 'open',
        requested_teams: [],
        requested_reviewers: [],
      },
    ];
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

  it('Should correctly bucket data', () => {
    const data = [
      {
        created_at: '2023-06-01 9:26:06 AM',
        data: [],
      },
      {
        created_at: '2023-06-01 2:04:11 PM',
        data: [],
      },
      {
        created_at: '2023-06-02 4:31:40 PM',
        data: [],
      },
      {
        created_at: '2023-06-03 9:26:06 AM',
        data: [],
      },
      {
        created_at: '2023-06-07 9:04:26 AM',
        data: [],
      },
      {
        created_at: '2023-06-09 9:27:24 AM',
        data: [],
      },
      {
        created_at: '2023-06-09 10:11:15 AM',
        data: [],
      },
      {
        created_at: '2023-06-09 3:02:30 PM',
        data: [],
      },
      {
        created_at: '2023-06-10 3:13:13 PM',
        data: [],
      },
      {
        created_at: '2023-06-11 3:25:44 PM',
        data: [],
      },
      {
        created_at: '2023-06-20 3:34:44 PM',
        data: [],
      },
      {
        created_at: '2023-06-21 09:41:39 AM',
        data: [],
      },
    ];
    const want = [
      {
        start: '2023-05-10 11:00:00 AM',
        end: '2023-05-24 10:59:59 AM',
        data: [],
      },
      {
        start: '2023-05-24 11:00:00 AM',
        end: '2023-06-07 10:59:59 AM',
        data: [
          { created_at: '2023-06-01 9:26:06 AM', data: [] },
          { created_at: '2023-06-01 2:04:11 PM', data: [] },
          { created_at: '2023-06-02 4:31:40 PM', data: [] },
          { created_at: '2023-06-03 9:26:06 AM', data: [] },
          { created_at: '2023-06-07 9:04:26 AM', data: [] },
        ],
      },
      {
        start: '2023-06-07 11:00:00 AM',
        end: '2023-06-21 10:59:59 AM',
        data: [
          { created_at: '2023-06-09 9:27:24 AM', data: [] },
          { created_at: '2023-06-09 10:11:15 AM', data: [] },
          { created_at: '2023-06-09 3:02:30 PM', data: [] },
          { created_at: '2023-06-10 3:13:13 PM', data: [] },
          { created_at: '2023-06-11 3:25:44 PM', data: [] },
          { created_at: '2023-06-20 3:34:44 PM', data: [] },
          { created_at: '2023-06-21 09:41:39 AM', data: [] },
        ],
      },
    ];

    const result = bucketDataByInterval({
      data,
      startDate: moment('2023-05-10 11:00:00 AM').toISOString(),
      endDate: moment('2023-06-21 10:59:59 AM').toISOString(),
      daysInterval: 14,
    });

    expect(result).toEqual(want);
  });

  it('Should correctly validate date format', () => {
    const testCases = [
      {
        date: '2023-04-04',
        dateFormat: 'YYYY-MM-DD h:mm:ss',
        want: false,
      },
      {
        date: '2023-06-22 3:56:29 PM',
        dateFormat: 'YYYY-MM-DD h:mm:ss A',
        want: true,
      },
    ];

    for (const { date, dateFormat, want } of testCases) {
      const result = isValidDateFormat(date, dateFormat);
      expect(result).toEqual(want);
    }
  });
});
