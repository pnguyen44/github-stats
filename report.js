const {
	getRepos,
	getRepoPullRequests,
	getTeamMembers,
} = require('./utils/githubUtils');
const { exportToExcel } = require('./utils/exportUtils');

const { TEAM } = require('./constant');

async function getAllPullRequests(teamMembers) {
	console.log('Getting all pull requests');
	let repos = [];
	let page = 0;

	do {
		page += 1;
		const result = await getRepos(page);
		repos = repos.concat(result);
	} while (result.length > 0);

	console.log('repos', repos.length);

	let pullRequests = [];

	for (const repo of repos) {
		page = 0;
		do {
			page += 1;
			const result = await getRepoPullRequests(teamMembers, repo, page);
			if (result.length) {
				pullRequests = pullRequests.concat(result);
			}
		} while (result.length > 0);
	}
	return pullRequests;
}

getTeamMembers(TEAM).then((result) => {
	const teamMembers = result;

	getAllPullRequests(teamMembers)
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
});
