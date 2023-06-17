const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
	auth: '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',
});

const OWNER = 'simplisafe';
const TEAM = 'camfam';

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

async function getRepoPullRequests(repo) {
	try {
		const response = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
			owner: OWNER,
			repo,
			headers: {
				'X-GitHub-Api-Version': '2022-11-28',
			},
		});

		const { data } = response;
		result = data.map((d) => {
			const { html_url, state, title, user, created_at, updated_at } = d;
			return {
				html_url,
				state,
				user,
				title,
				user: user.login,
				created_at,
				updated_at,
			};
		});
		// console.log(result);
		return result;
	} catch (error) {
		console.error('Error fetching repository pull requests:', error);
	}
}

module.exports = { getRepos, getRepo, getRepoPullRequests };
