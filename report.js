const { getRepos, getRepoPullRequests } = require('./githubUtils');

async function getAllPullRequests() {
	const repos = await getRepos();
	const pullRequests = [];

	for (const repo of repos) {
		const pr = await getRepoPullRequests(repo);
		if (pr.length) {
			pullRequests.push(pr);
		}
	}
	return pullRequests;
}

getAllPullRequests().then(console.log);
