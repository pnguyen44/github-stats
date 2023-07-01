import {
  resolveDateRange,
  bucketDataByInterval,
  capitalizeFirstLetter,
} from './utils/reportUtils';
import { PR_STATE } from './constant';
import { config } from './config';

export class ReportGenerator {
  constructor(github, stats, exporter) {
    this.gh = github;
    this.stats = stats;
    this.exporter = exporter;
  }

  _resolveDateRange(state, startDate, endDate, startDaysAgo) {
    const dateRange = resolveDateRange(startDate, endDate, startDaysAgo);

    const { startDate: start, endDate: end } = dateRange;

    if (state === PR_STATE.closed && !start && !end) {
      throw new Error(
        'Closed PRs report require absolute or relative date range'
      );
    }

    return dateRange;
  }

  _getExcludedReposExcelData() {
    return {
      sheetName: 'excluded repos',
      data: ['excluded repos', ...config.excludeRepos],
    };
  }

  createPullRequestsReport({
    name = 'PRs',
    state,
    startDate,
    endDate,
    startDaysAgo,
  }) {
    const { startDate: start, endDate: end } = this._resolveDateRange(
      state,
      startDate,
      endDate,
      startDaysAgo
    );

    if (state) {
      name = `${capitalizeFirstLetter(state)} ${name}`;
    }

    this.stats
      .getTeamsPullRequest({ state, startDate: start, endDate: end })
      .then((data) => {
        if (!data.length) {
          console.log('No results to report');
          return;
        }
        this.exporter.exportToExcel(name, [{ sheetName: 'data', data }]);
      })
      .catch((err) => {
        throw new Error(`Error in creating pull requests report: ${err}`);
      });
  }

  createDependabotPRsReport({
    name = 'Dependabot PRs',
    state = PR_STATE.open,
    startDate,
    endDate,
    startDaysAgo,
  }) {
    const { startDate: start, endDate: end } = this._resolveDateRange(
      state,
      startDate,
      endDate,
      startDaysAgo
    );

    if (state) {
      name = `${capitalizeFirstLetter(state)} ${name}`;
    }

    this.stats
      .getDependabotPRs({ state, startDate: start, endDate: end })
      .then((data) => {
        if (!data.length) {
          console.log('No results to report');
          return;
        }

        this.exporter.exportToExcel(name, [
          { sheetName: 'data', data },
          this._getExcludedReposExcelData(),
        ]);
      })
      .catch((err) => {
        throw new Error(`Error in creating dependabot report: ${err}`);
      });
  }

  create24hReviewStatsReport({
    name = 'PRs 24h Review Stats',
    state,
    startDate,
    endDate,
    startDaysAgo,
    daysInterval,
  }) {
    const { startDate: start, endDate: end } = this._resolveDateRange(
      state,
      startDate,
      endDate,
      startDaysAgo
    );

    if (state) {
      name = `${capitalizeFirstLetter(state)} ${name}`;
    }

    this.stats
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

        this.exporter.exportToExcel(name, [
          { sheetName: 'data', data },
          { sheetName: 'summary', data: summaries },
          this._getExcludedReposExcelData(),
        ]);
      })
      .catch((err) => {
        throw new Error(`Error in creating 24h review stats report: ${err}`);
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

  createTeamsReposReport() {
    const name = 'Teams repos';
    this.gh
      .getTeamsRepos()
      .then((data) => {
        if (!data.length) {
          console.log('No results to report');
          return;
        }

        const updatedData = data.map((repo) => ({ name: repo }));

        this.exporter.exportToExcel(name, [
          { sheetName: 'data', data: updatedData },
        ]);
      })
      .catch((err) => {
        throw new Error(`Error in creating teams repos report: ${err}`);
      });
  }
}
