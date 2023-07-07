import { GitHub } from './github';
import { PR_STATE } from './constant';

import { Exporter } from './exporter';
import { Stats } from './stats';
import { ReportGenerator } from './ReportGenerator';

import { config } from './config';

const options = {
  owner: config.owner,
  token: config.token,
  teams: config.teams,
};

const gh = new GitHub(options);
const stats = new Stats(gh);
const exporter = new Exporter();
const reportGenerator = new ReportGenerator(gh, stats, exporter);

// using relative date range
// const startDaysAgo = 14;
// reportGenerator.createDependabotPRsReport({
//   startDaysAgo,
// });

// using a absolute date range
// reportGenerator.create24hReviewStatsReport({
//   startDate: '2023-01-04 11:00:00 AM',
//   endDate: '2023-07-05 10:59:59 AM',
//   daysInterval: 14,
//   withBreakdown: true,
// });

reportGenerator.createDependabotPRsReport({
  state: PR_STATE.open,
});
