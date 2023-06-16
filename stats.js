const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
	auth: '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',
});

const OWNER = 'simplisafe';

async function getRepos() {
	try {
		const response = await octokit.request('GET /orgs/{owner}/repos', {
			owner: OWNER,
		});

		const { data } = response;
		console.log(response.status);
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

async function getRepositoryPullRequest(owner, repo, perPage = 10) {
	try {
		const response = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
			owner: OWNER,
			repo,
			per_page: perPage,
			headers: {
				'X-GitHub-Api-Version': '2022-11-28',
			},
		});

		const { data } = response.data;
		// console.log(prs);
		console.log(response.status);
	} catch (error) {
		console.error('Error fetching repository pull requests:', error);
	}
}

getRepos();
getRepo('bender');
getRepositoryPullRequest('simplisafe', 'bender', 2);
