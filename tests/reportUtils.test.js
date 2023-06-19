const { sortDataByField } = require('../utils/reportUtils');

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
});
