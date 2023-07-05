import moment from 'moment';
import { reviewedWithin24hrs } from './utils/reportUtils';

export class Stats {
  constructor(github) {
    this.gh = github;
  }

  async get24hReviewStats({ state, startDate, endDate }) {
    const teamMembers = await this.gh.getAllTeamMembers();

    const prs = await this.gh.getPullRequests({
      state,
      startDate,
      endDate,
      teamMembers,
    });

    for (const pr of prs) {
      const { html_url, repo } = pr;
      const pullNumber = html_url.split('/').pop();
      // get issue events
      const issueEvents = await this.gh.getIssueEvents(repo, pullNumber);

      const reviewRequests = issueEvents.filter(
        (event) => event.event === 'review_requested'
      );

      // get reviews
      const reviews = await this.gh.getReviews(repo, pullNumber);

      const doneWithin24hr = reviewedWithin24hrs(
        reviewRequests,
        reviews,
        moment()
      );

      pr.review_requested = reviewRequests.length > 0;
      pr.reviewed_within_24_hours = doneWithin24hr;
    }

    return prs;
  }
}
