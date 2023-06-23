const { Octokit } = require('@octokit/rest');

const { formatDate, getRelativeDateRange } = require('./utils/reportUtils');
const { PR_STATE } = require('./constant');

class GitHub {
  constructor({ owner, perPage, token, teams }) {
    this.octokit = new Octokit({
      auth: token,
    });

    this.headers = {
      'X-GitHub-Api-Version': '2022-11-28',
    };

    this.owner = owner;
    this.perPage = perPage;
    this.teams = teams;
  }

  async _request(endpoint, parameters) {
    try {
      const options = {
        ...parameters,
        per_page: this.perPage,
        headers: this.headers,
      };
      return await this.octokit.paginate(endpoint, parameters);
    } catch (err) {
      console.log(`Error on ${endpoint}: ${err}`);
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

  async searchIssues({ repos, state, startDate, endDate }, filterCallback) {
    const r = repos.map((r) => `repo:${this.owner}/${r}`).join(' ');
    const s = state ? `state:${state}` : '';
    const q = `${r} is:pr ${s} created:${startDate}..${endDate}`;

    let result = await this.octokit
      .request('GET /search/issues', {
        q,
      })
      .then((response) => response.data.items);

    if (typeof filterCallback === 'function') {
      return result.filter(filterCallback);
    }

    return result;
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

  async getRepoPullRequests(repo, state = PR_STATE.open, filterCallback) {
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

  async getTeamsPullRequests({
    state = PR_STATE.open,
    startDate,
    endDate,
    startDaysAgo = 0,
  }) {
    console.log('Getting pull requests');
    const teamMembers = await this.getAllTeamMembers();
    const repos = await this.getAllReposForTeams(this.teams);
    let result = [];

    const filterCallback = (d) => {
      const { login } = d.user;
      return teamMembers.includes(login);
    };

    if (!startDate && !endDate && startDaysAgo <= 0) {
      for (const repo of repos) {
        const pullRequests = await this.getRepoPullRequests(
          repo,
          state,
          filterCallback
        );
        result = result.concat(pullRequests);
      }
      return result;
    }

    if (startDaysAgo > 0) {
      const { startDate: start, endDate: end } =
        getRelativeDateRange(startDaysAgo);
      startDate = start;
      endDate = end;
    }

    const options = {
      repos,
      startDate,
      endDate,
      state,
    };

    const data = await this.searchIssues(options, filterCallback);
    const items = data.map((d) => {
      const repo = d.repository_url.split('/').pop();
      return {
        pullNumber: d.number,
        repo,
      };
    });

    for (const { repo, pullNumber } of items) {
      const d = await this.getPullRequest(repo, pullNumber);
      result = result.concat(this._parsePullRequestResponse(d));
    }
    return result;
  }
}

module.exports = {
  GitHub,
};
