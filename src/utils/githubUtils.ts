import { Octokit } from '@octokit/rest';

import { OWNER, PER_PAGE, TOKEN, MAX_PAGE } from '../../src/config';
import { formatDate } from './reportUtils';
import { PR_STATE, PullRequestState } from '../../src/constant';

const octokit = new Octokit({
  auth: TOKEN,
});

const headers = {
  'X-GitHub-Api-Version': '2022-11-28',
};

async function getTeamMembers(
  page: number,
  team: string
): Promise<Array<string>> {
  try {
    const response = await octokit.request(
      'GET /orgs/{org}/teams/{team_slug}/members',
      {
        org: OWNER,
        team_slug: team,
        per_page: PER_PAGE,
        page,
        headers,
      }
    );
    const { data } = response;
    const result = data.map((d) => d.login);
    return result;
  } catch (err) {
    console.log('Error in getting team members', err);
    return [];
  }
}

export async function getAllTeamMembers(
  teams: Array<string>
): Promise<string[]> {
  let result: string[] = [];
  let data;
  for (const team of teams) {
    data = await paginate(getTeamMembers, team);
    result = result.concat(data);
  }
  const unique = [...new Set(result)];
  console.log('team members', unique.length);
  return unique;
}

async function getRepos(
  page: number,
  team: string
): Promise<Array<Record<string, any>> | void> {
  console.log('get repo page', page);
  try {
    const response = await octokit.request(
      'GET /orgs/{org}/teams/{team_slug}/repos',
      {
        org: OWNER,
        team_slug: team,
        per_page: PER_PAGE,
        page,
        headers,
      }
    );

    const { data } = response;
    const result: Array<Record<string, any>> = data.map((d) => ({
      name: d.name,
    }));
    return result;
  } catch (err) {
    console.log('Error in getting repos', err);
  }
}

export async function getAllReposForTeams(
  teams: Array<string>
): Promise<string[]> {
  console.log('Getting repos for teams');

  let result: string[] = [];
  let data;

  for (const team of teams) {
    console.log('Getting repos for team:', team);
    data = await paginate(getRepos, team);
    result = result.concat(data);
  }

  const unique = [...new Set(result)];
  console.log('total repos', unique.length);
  return unique;
}

export async function getRepo(repo: string): Promise<void> {
  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}', {
      owner: OWNER,
      repo,
      headers,
    });

    console.log(response.status);
  } catch (error) {
    console.error('Error fetching repo:', error);
  }
}

export async function getRepoPullRequests(
  page = 1,
  teamMembers: string[],
  repo: string,
  state: PullRequestState = PR_STATE.open
): Promise<Array<Record<string, any>>> {
  if (page > MAX_PAGE) {
    return [];
  }

  console.log('get pull request: repo=', repo, 'page=', page);

  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
      owner: OWNER,
      per_page: PER_PAGE,
      page,
      repo,
      state,
      headers,
    });

    const { data } = response;

    const result: Array<Record<string, any>> = data
      .filter((d: Record<string, any>) => {
        const { login } = d.user;
        return teamMembers.includes(login);
      })
      .map((d: Record<string, any>) => {
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

        const requestedTeam: string[] =
          requested_teams?.map((r: Record<string, any>) => r.name) || [];
        const requestedReviewers: string[] =
          requested_reviewers?.map((r: Record<string, any>) => r.login) || [];

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

    return result;
  } catch (error) {
    console.error('Error fetching repository pull requests:', error);
    return [];
  }
}

export async function paginate(
  func: (...args: any) => Promise<any>,
  ...args: any[]
): Promise<Array<any>> {
  let result: Record<string, any>[] = [];
  let page = 0;
  let data;

  do {
    page += 1;
    data = await func(page, ...args);
    if (data) {
      result = result.concat(data);
    }
  } while (data && data.length > 0);

  return result;
}
