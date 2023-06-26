import { Report } from './report';
import { GitHub } from './github';
import { PR_STATE } from './constant';

import { TEAMS, OWNER, TOKEN } from './config';

const config = {
  owner: OWNER,
  token: TOKEN,
  teams: TEAMS,
};

const gh = new GitHub(config);

const report = new Report(gh);

report.create24hReviewStats('PRs', {
  state: PR_STATE.open,
});

// using relative date range
// const startDaysAgo = 4;
// report.create24hReviewStats(`PR from last ${startDaysAgo} days`, {
//   startDaysAgo,
// });

// using a absolute date range
// report.create24hReviewStats('PRs', {
//   startDate: '2023-06-07',
//   endDate: '2023-06-21',
// });
