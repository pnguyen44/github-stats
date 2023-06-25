const { Report } = require('./report');
const { GitHub } = require('./github');
const { PR_STATE } = require('./constant');

const { TEAMS, OWNER, PER_PAGE, TOKEN } = require('./config');

const config = {
  owner: OWNER,
  perPage: PER_PAGE,
  token: TOKEN,
  teams: TEAMS,
};

const gh = new GitHub(config);

const report = new Report(gh);

report.createPullRequestsReport('Open PRs', {
  state: PR_STATE.open,
});

// using relative date range
// const startDaysAgo = 10;
// report.createPullRequestsReport(`PR from last ${startDaysAgo} days`, {
//   startDaysAgo,
// });

// using a absolute date range
// report.create24hReviewStats('PRs', {
//   startDate: '2023-06-07',
//   endDate: '2023-06-21',
// });
