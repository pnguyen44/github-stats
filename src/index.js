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

// using relative date range
// const startDaysAgo = 14;
// report.create24hReviewStats(`PR from last ${startDaysAgo} days`, {
//   startDaysAgo,
// });

// using a absolute date range
// report.create24hReviewStats('PRs', {
// startDate: '2023-05-10',
// endDate: '2023-06-20',
// daysInterval: 14,
// });

report.createPullRequestsReport('PRs', {
  state: PR_STATE.open,
});
