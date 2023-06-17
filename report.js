const {
	getRepos,
	getRepoPullRequests,
	getTeamMembers,
	paginate,
} = require('./utils/githubUtils');
const { exportToExcel } = require('./utils/exportUtils');

const { TEAM } = require('./constant');

async function getAllPullRequests(teamMembers) {
	console.log('Getting all pull requests');

	const repos = await paginate(getRepos);

	console.log('repos', repos.length);

	let result = [];

	for (const repo of repos) {
		const pullRequests = await paginate(getRepoPullRequests, teamMembers, repo);
		result = result.concat(pullRequests);
	}
	return result;
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
