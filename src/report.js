const { GitHub } = require('./github');
const { exportToExcel } = require('../src/utils/exportUtils');
const { sortDataByField } = require('../src/utils/reportUtils');
const { PR_STATE } = require('./constant');

class Report {
  constructor(gh) {
    this.gh = gh;
  }

  createPullRequestsReport(
    name,
    { state = PR_STATE.open, startDate, endDate, startDaysAgo }
  ) {
    this.gh
      .getTeamsPullRequests({ state, startDate, endDate, startDaysAgo })
      .then((data) => {
        if (!data.length) {
          console.log('No results to report');
          return;
        }

        const sortedData = sortDataByField(data, 'created_at', 'asc');

        exportToExcel(name, sortedData)
          .then(() => {
            console.log('Data exported to Excel successfully');
          })
          .catch((error) => {
            console.error('Error exporting data to Excel:', error);
          });
      })
      .catch((err) => {
        console.log('Error in getting all pull request', err);
      });
  }
}

module.exports = { Report };
