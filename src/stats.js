import moment from 'moment';
import {
  reviewedWithin24hrs,
  reviewedWithin24hrWithBreakdown,
} from './utils/reportUtils';

export class Stats {
  constructor(github) {
    this.gh = github;
  }

  async get24hReviewStats({
    state,
    startDate,
    endDate,
    withBreakdown = false,
  }) {
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

      pr.review_requested = reviewRequests.length > 0;

      if (!withBreakdown) {
        const doneWithin24hr = reviewedWithin24hrs(
          reviewRequests,
          reviews,
          moment()
        );

        pr.reviewed_within_24_hours = doneWithin24hr;
      } else {
        const {
          initialReviewedWithin24h,
          rerequestReviewedWithin24h,
          totalRerequest,
        } = reviewedWithin24hrWithBreakdown(reviewRequests, reviews, moment());

        pr.initial_reviewed_within_24h = initialReviewedWithin24h;
        pr.rerequest_review = totalRerequest > 0;
        pr.rerequest_reviewed_within_24h = rerequestReviewedWithin24h;
      }
    }

    return prs;
  }
}
