import { GitHub } from './github';
import { PR_STATE } from './constant';

import { TEAMS, OWNER, TOKEN } from './config';
import { Exporter } from './exporter';
import { Stats } from './stats';
import { ReportGenerator } from './ReportGenerator';

const config = {
  owner: OWNER,
  token: TOKEN,
  teams: TEAMS,
};

const gh = new GitHub(config);
const stats = new Stats(gh);
const exporter = new Exporter();
const reportGenerator = new ReportGenerator(gh, stats, exporter);

// using relative date range
// const startDaysAgo = 14;
// reportGenerator.create24hReviewStatsReport(`PR from last ${startDaysAgo} days`, {
//   startDaysAgo,
// });

// using a absolute date range
// reportGenerator.create24hReviewStatsReport('PRs', {
//   startDate: '2023-05-10 11:00:00 AM',
//   endDate: '2023-06-21 10:59:59 AM',
//   daysInterval: 14,
// });

reportGenerator.createPullRequestsReport('PRs', {
  state: PR_STATE.open,
});
