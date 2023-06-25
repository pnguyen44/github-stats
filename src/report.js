const { exportToExcel } = require('../src/utils/exportUtils');
const {
  sortDataByField,
  resolveDateRange,
} = require('../src/utils/reportUtils');
const { PR_STATE } = require('./constant');

class Report {
  constructor(gh) {
    this.gh = gh;
  }

  _exportToExcel(name, sortedData) {
    exportToExcel(name, sortedData)
      .then(() => {
        console.log('Data exported to Excel successfully');
      })
      .catch((error) => {
        console.error('Error exporting data to Excel:', error);
      });
  }

  createPullRequestsReport(name, { state, startDate, endDate, startDaysAgo }) {
    this.gh
      .getTeamsPullRequests({ state, startDate, endDate, startDaysAgo })
      .then((data) => {
        if (!data.length) {
          console.log('No results to report');
          return;
        }
        // console.log('__', data);
        const sortedData = sortDataByField(data, 'created_at', 'asc');
        this._exportToExcel(name, sortedData);
      })
      .catch((err) => {
        console.log('Error in getting all pull request', err);
      });
  }

  create24hReviewStats(name, { state, startDate, endDate, startDaysAgo }) {
    const dateRange = resolveDateRange({
      startDate,
      endDate,
      startDaysAgo,
    });
    const start = dateRange?.startDate;
    const end = dateRange?.endDate;

    this.gh
      .get24hReviewStats({ state, startDate: start, endDate: end })
      .then((data) => {
        if (!data.length) {
          console.log('No results to report');
          return;
        }
        console.log('__', data);
        const excelData = sortDataByField(data, 'created_at', 'asc');
        const summary = this._get24hReviewSummary(data, {
          startDate: start,
          endDate: end,
        });
        excelData.push(['']);
        excelData.push(['']);
        excelData.push([summary]);
        this._exportToExcel(name, excelData);
      })
      .catch((err) => {
        console.log('Error in getting all pull request', err);
      });
  }
  _get24hReviewSummary(data, { startDate, endDate }) {
    const totalCreated = data.length;
    const totalOpen = data.filter((d) => d.state === PR_STATE.open).length;
    const totalClosed = data.filter((d) => d.state === PR_STATE.closed).length;
    const notReviewedWithin24hr = data.filter(
      (d) => d.reviewed_within_24_hours === false
    ).length;
    const percentageNotReviewWithin24hr = (
      (notReviewedWithin24hr / totalCreated) *
      100
    ).toFixed(2);

    let str = '';

    if (startDate && endDate) {
      str += `Range: ${startDate} - ${endDate}\n`;
    }

    str +=
      `Total created: ${totalCreated} | Total open: ${totalOpen} | Total closed: ${totalClosed}\n` +
      `Total not reviewed within 24hrs: ${notReviewedWithin24hr} | Percentage not reviewed within 24hrs: ${percentageNotReviewWithin24hr}%`;

    return str;
  }
}

module.exports = { Report };
