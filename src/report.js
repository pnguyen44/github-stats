import { Export } from '../src/utils/exportUtils';
import {
  resolveDateRange,
  bucketDataByInterval,
} from '../src/utils/reportUtils';
import { PR_STATE } from './constant';

export class Report {
  constructor(gh) {
    this.gh = gh;
    this.export = new Export();
  }

  createPullRequestsReport(name, { state, startDate, endDate, startDaysAgo }) {
    this.gh
      .getTeamsPullRequests({ state, startDate, endDate, startDaysAgo })
      .then((data) => {
        if (!data.length) {
          console.log('No results to report');
          return;
        }
        this.export.toExcel(name, [{ sheetName: 'data', data }]);
      })
      .catch((err) => {
        throw new Error(`Error in creating pull requests report: ${err}`);
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

        this.export.toExcel(name, [
          { sheetName: 'data', data },
          { sheetName: 'summary', data: summaries },
        ]);
      })
      .catch((err) => {
        throw Error(`Error in creating 24h review stats report: ${err}`);
      });
  }

  _get24hReviewSummary(data, startDate, endDate) {
    const totalCreated = data.length;
    const totalOpen = data.filter((d) => d.state === PR_STATE.open).length;
    const totalClosed = data.filter((d) => d.state === PR_STATE.closed).length;
    const totalPRsWithReviewRequest = data.filter(
      (d) => d.review_requested
    ).length;
    const notReviewedWithin24hr = data.filter(
      (d) => d.reviewed_within_24_hours === false
    ).length;
    const percentageNotReviewWithin24hr = (
      (notReviewedWithin24hr / totalPRsWithReviewRequest) *
      100
    ).toFixed(2);

    return {
      start_date: startDate,
      end_date: endDate,
      total_created: totalCreated,
      total_open: totalOpen,
      total_closed: totalClosed,
      total_prs_with_review_request: totalPRsWithReviewRequest,
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
