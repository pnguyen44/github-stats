const { getRepos, getRepoPullRequests } = require('./utils/githubUtils');
const { exportToExcel } = require('./utils/exportUtils');

async function getAllPullRequests() {
	console.log('Getting all pull requests');
	const repos = await getRepos();
	let pullRequests = [];

	for (const repo of repos) {
		const prs = await getRepoPullRequests(repo);
		if (prs.length) {
			pullRequests = pullRequests.concat(prs);
		}
	}
	return pullRequests;
}

getAllPullRequests()
	.then((data) => {
		exportToExcel('Pull Request', data)
			.then(() => {
				console.log('Data exported to Excel successfully');
			})
			.catch((error) => {
				console.error('Error exporting data to Excel:', error);
			});
	})
	.catch((err) => {
		console.log('Error in getting all pull request', err);
	});
