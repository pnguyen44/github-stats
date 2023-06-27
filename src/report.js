import { exportToExcel } from '../src/utils/exportUtils';
import {
  resolveDateRange,
  bucketDataByInterval,
} from '../src/utils/reportUtils';
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
        this._exportToExcel(name, [{ sheetName: 'data', data }]);
      })
      .catch((err) => {
        console.log('Error in getting all pull request:', err);
      });
  }

  create24hReviewStats(
    name,
    { state, startDate, endDate, startDaysAgo, daysInterval }
  ) {
    const dateRange = resolveDateRange({
      startDate,
      endDate,
      startDaysAgo,
    });

    if (Object.keys(dateRange).length === 0) {
      throw new Error('Require absolute or relative date range');
    }

    const start = dateRange?.startDate;
    const end = dateRange?.endDate;

    this.gh
      .get24hReviewStats({
        state,
        startDate: start,
        endDate: end,
      })
      .then((data) => {
        if (!data.length) {
          console.log('No results to report');
          return;
        }

        const summaries = this._get24hReviewSummaryByInterval({
          data,
          startDate: start,
          endDate: end,
          daysInterval,
        });

        this._exportToExcel(name, [
          { sheetName: 'data', data },
          { sheetName: 'summary', data: summaries },
        ]);
      })
      .catch((err) => {
        console.log('Error in getting all pull request', err);
      });
  }

  _get24hReviewSummary(data, startDate, endDate) {
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

  _get24hReviewSummaryByInterval({ data, startDate, endDate, daysInterval }) {
    const result = [];
    let buckets;

    if (!daysInterval || daysInterval <= 0) {
      buckets = [
        {
          start: startDate,
          end: endDate,
          data,
        },
      ];
    } else {
      buckets = bucketDataByInterval({
        data,
        startDate,
        endDate,
        daysInterval,
      });
    }

    for (const { start, end, data: d } of buckets) {
      const summary = this._get24hReviewSummary(d, start, end);
      result.push(summary);
    }
    return result;
  }
}
