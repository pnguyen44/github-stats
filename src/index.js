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

let state = PR_STATE.open;
report.createPullRequestsReport(`${state} PRs`, {
  state,
});

// // using relative date range
// const startDaysAgo = 10;
// report.createPullRequestsReport(`${state} PR from last ${startDaysAgo} days`, {
//   state,
//   startDaysAgo,
// });

// // using a absolute date range
// const startDate = '2023-05-16';
// const endDate = '2023-06-20';
// report.createPullRequestsReport(`${state} PRs [${startDate} - ${endDate}]`, {
//   state,
//   startDate,
//   endDate,
// });
