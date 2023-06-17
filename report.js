const {
	getRepos,
	getRepoPullRequests,
	getTeamMembers,
} = require('./utils/githubUtils');
const { exportToExcel } = require('./utils/exportUtils');

const { TEAM } = require('./constant');

async function getAllPullRequests(teamMembers) {
	console.log('Getting all pull requests');
	const repos = await getRepos();
	console.log('repos', repos);
	let pullRequests = [];

	for (const repo of repos) {
		const prs = await getRepoPullRequests(teamMembers, repo);
		if (prs.length) {
			pullRequests = pullRequests.concat(prs);
		}
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
