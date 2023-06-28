import { Octokit } from '@octokit/rest';
import moment from 'moment';

import {
  formatDate,
  sortDataByField,
  reviewedWithin24hrs,
} from './utils/reportUtils';
import { PR_STATE } from './constant';

export class GitHub {
  constructor({ owner, token, teams }) {
    this.octokit = new Octokit({
      auth: token,
    });

    this.headers = {
      'X-GitHub-Api-Version': '2022-11-28',
    };

    this.owner = owner;
    this.teams = teams;
  }

  async _request(endpoint, parameters) {
    const options = {
      ...parameters,
      per_page: 100,
    };

    try {
      return await this.octokit.paginate(endpoint, options);
    } catch (err) {
      throw new Error(`Error on ${endpoint}. Error: ${err}`);
    }
  }

  async _getTeamMembers(team) {
    const data = await this._request(
      'GET /orgs/{org}/teams/{team_slug}/members',
      {
        org: this.owner,
        team_slug: team,
      }
    );

    return data.map((d) => d.login);
  }

  async getAllTeamMembers() {
    let result = [];
    let data;
    for (const team of this.teams) {
      data = await this._getTeamMembers(team);
      result = result.concat(data);
    }
    const unique = [...new Set(result)];
    console.log('team members', unique.length);
    return unique;
  }

  async getRepo(repo) {
    const response = await this._request('GET /repos/{owner}/{repo}', {
      owner: this.owner,
      repo,
    });
    return response;
  }

  async _getRepos(team) {
    const response = await this._request(
      'GET /orgs/{org}/teams/{team_slug}/repos',
      {
        org: this.owner,
        team_slug: team,
      }
    );
    return response.map((d) => d.name);
  }

  async getAllReposForTeams() {
    console.log('Getting repos for teams');

    let result = [];
    let data;

    for (const team of this.teams) {
      console.log('Getting repos for team:', team);
      data = await this._getRepos(team);
      result = result.concat(data);
    }

    const unique = [...new Set(result)];
    console.log('total repos', unique.length);
    return unique;
  }

  async searchIssues({ repos, authors, state, createdRange, updatedRange }) {
    console.log('Searching issues');
    const repo = repos.map((r) => `repo:${this.owner}/${r}`).join(' ');
    const s = state ? `state:${state}` : '';
    const author = authors.map((author) => `author:${author}`).join(' ');
    let created = '';
    let updated = '';

    if (createdRange?.start && createdRange?.end) {
      created = `created:${createdRange?.start}..${createdRange?.end}`;
    }

    if (updatedRange?.start && updatedRange?.end) {
      updated = `updated:${updatedRange?.start}..${updatedRange?.end}`;
    }

    const q = `${repo} is:pr ${s} ${author} ${created} ${updated}`;

    return await this._request('GET /search/issues?q=' + encodeURIComponent(q));
  }

  _parseSearchIssueResponse(data) {
    return data.map((d) => {
      const {
        html_url,
        state,
        title,
        user: { login },
        created_at,
        updated_at,
      } = d;

      return {
        created_at: formatDate(created_at),
        updated_at: formatDate(updated_at),
        state,
        user: login,
        title,
        html_url,
      };
    });
  }

  async getPullRequest(repo, pullNumber) {
    return await this._request(
      'GET /repos/{owner}/{repo}/pulls/{pull_number}',
      {
        owner: this.owner,
        repo,
        pull_number: pullNumber,
      }
    );
  }

  async getRepoPullRequests(repo, state, filterCallback) {
    let result = await this._request('GET /repos/{owner}/{repo}/pulls', {
      owner: this.owner,
      repo,
      state,
    });

    if (typeof filterCallback === 'function') {
      result = result.filter(filterCallback);
    }

    return this._parsePullRequestResponse(result);
  }
  _parsePullRequestResponse(data) {
    return data.map((d) => {
      const {
        html_url,
        state,
        title,
        user: { login },
        created_at,
        updated_at,
        requested_teams,
        requested_reviewers,
        base: {
          repo: { name },
        },
      } = d;

      const requestedTeam = requested_teams.map((r) => r.name);
      const requestedReviewers = requested_reviewers.map((r) => r.login);

      return {
        created_at: formatDate(created_at),
        updated_at: formatDate(updated_at),
        state,
        user: login,
        repo: name,
        title,
        html_url,
        requested_teams: requestedTeam,
        requested_reviewers: requestedReviewers,
      };
    });
  }

  async getIssueEvents(repo, issueNumber) {
    return await this._request(
      'GET /repos/{owner}/{repo}/issues/{issue_number}/events',
      {
        owner: this.owner,
        repo,
        issue_number: issueNumber, // PR number
      }
    );
  }

  async getReviews(repo, pullNumber) {
    return await this._request(
      'GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews',
      {
        owner: this.owner,
        repo,
        pull_number: pullNumber,
      }
    );
  }

  async getTeamsPullRequests({ state, startDate, endDate }) {
    // Prevent request for closed PRs with no date range
    if ((!state || state === PR_STATE.closed) && (!startDate || !endDate)) {
      throw new Error(
        'Request for closed PRs requires a relative or absolute date range'
      );
    }

    console.log('Getting pull requests');

    const teamMembers = await this.getAllTeamMembers();
    const repos = await this.getAllReposForTeams(this.teams);
    let result = [];

    const options = {
      repos,
      state,
      authors: teamMembers,
    };

    if (startDate && endDate) {
      options.createdRange = {
        start: startDate,
        end: endDate,
      };

      options.updatedRange = {
        start: startDate,
        end: endDate,
      };
    }

    const data = await this.searchIssues(options);
    const items = data.map((d) => {
      const repo = d.repository_url.split('/').pop();
      return {
        pullNumber: d.number,
        repo,
      };
    });

    for (const { repo, pullNumber } of items) {
      const pulls = await this.getPullRequest(repo, pullNumber);
      // remove closed PRs that have not been merged
      const filtered = pulls.filter((pr) => {
        if (pr.state === PR_STATE.closed && !pr.merged_at) {
          return false;
        }

        return true;
      });
      result = result.concat(this._parsePullRequestResponse(filtered));
    }
    return sortDataByField(result, 'created_at', 'asc');
  }

  async get24hReviewStats({ state, startDate, endDate }) {
    const prs = await this.getTeamsPullRequests({
      state,
      startDate,
      endDate,
    });

    for (const pr of prs) {
      const { html_url, repo } = pr;
      const pullNumber = html_url.split('/').pop();
      // get issue events
      const issueEvents = await this.getIssueEvents(repo, pullNumber);

      const reviewRequests = issueEvents.filter(
        (event) => event.event === 'review_requested'
      );

      // get reviews
      const reviews = await this.getReviews(repo, pullNumber);

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
