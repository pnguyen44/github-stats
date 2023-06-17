const { Octokit } = require('@octokit/rest');

const { OWNER, TEAM } = require('../constant');

const octokit = new Octokit({
	auth: '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',
});

async function getTeamMembers(team) {
	try {
		const response = await octokit.request(
			'GET /orgs/{org}/teams/{team_slug}/members',
			{
				org: OWNER,
				team_slug: team,
				headers: {
					'X-GitHub-Api-Version': '2022-11-28',
				},
			}
		);
		const { data } = response;
		result = data.map((d) => d.login);
		return result;
	} catch (err) {
		console.log('Error in getting team members', err);
	}
}

async function getRepos() {
	try {
		const response = await octokit.request(
			'GET /orgs/{org}/teams/{team_slug}/repos',
			{
				org: OWNER,
				team_slug: TEAM,
				headers: {
					'X-GitHub-Api-Version': '2022-11-28',
				},
			}
		);

		const { data } = response;
		result = data.map((d) => d.name);
		// console.log(result);
		return result;
	} catch (err) {
		console.log('Error in getting repos', err);
	}
}

async function getRepo(repo) {
	try {
		const response = await octokit.request('GET /repos/{owner}/{repo}', {
			owner: OWNER,
			repo,
			headers: {
				'X-GitHub-Api-Version': '2022-11-28',
			},
		});

		const { data } = response;
		// console.log(data);
		console.log(response.status);
	} catch (error) {
		console.error('Error fetching repo:', error);
	}
}

async function getRepoPullRequests(teamMembers, repo) {
	try {
		const response = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
			owner: OWNER,
			repo,
			headers: {
				'X-GitHub-Api-Version': '2022-11-28',
			},
		});

		const { data } = response;

		result = data
			.filter((d) => {
				const { login } = d.user;
				return teamMembers.includes(login);
			})
			.map((d) => {
				const { html_url, state, title, user, created_at, updated_at } = d;
				const { login } = user;
				return {
					html_url,
					state,
					title,
					login,
					created_at,
					updated_at,
				};
			});
		return result;
	} catch (error) {
		console.error('Error fetching repository pull requests:', error);
	}
}

module.exports = { getRepos, getRepo, getRepoPullRequests, getTeamMembers };
