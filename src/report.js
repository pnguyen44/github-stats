import { exportToExcel } from '../src/utils/exportUtils';
import moment from 'moment';
import { resolveDateRange } from '../src/utils/reportUtils';
import { PR_STATE } from './constant';

export class Report {
  constructor(gh) {
    this.gh = gh;
  }

  _exportToExcel(fileName, data) {
    exportToExcel(fileName, data)
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
        this._exportToExcel(name, [{ sheetName: 'raw', data }]);
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
        const summary = this._get24hReviewSummary(data, {
          startDate: start,
          endDate: end,
        });

        this._exportToExcel(name, [
          { sheetName: 'raw', data },
          { sheetName: 'summary', data: [summary] },
        ]);
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

    let start = startDate;
    let end = endDate;

    const dateFormat = 'YYYY-MM-DDTHH:mm:ss[Z]';

    if (!start || !start) {
      start = moment(data[0].created_at, dateFormat).format('YYYY-MM-DD');
      end = moment(data[data.length - 1].created_at, dateFormat).format(
        'YYYY-MM-DD'
      );
    }

    return {
      start_date: start,
      end_date: end,
      total_created: totalCreated,
      total_open: totalOpen,
      total_closed: totalClosed,
      not_reviewed_within_24h: notReviewedWithin24hr,
      percentage_not_reviewed_within_24h: `${percentageNotReviewWithin24hr}%`,
    };
  }
}
