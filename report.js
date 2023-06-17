const {
	getRepoPullRequests,
	getAllTeamMembers,
	getAllReposForTeams,
	paginate,
} = require('./utils/githubUtils');
const { exportToExcel } = require('./utils/exportUtils');

const { TEAMS } = require('./config');

async function getAllPullRequests(teamMembers) {
	console.log('Getting all pull requests');

	const repos = await getAllReposForTeams(TEAMS);

	let result = [];

	for (const repo of repos) {
		const pullRequests = await paginate(getRepoPullRequests, teamMembers, repo);
		result = result.concat(pullRequests);
	}
	return result;
}

getAllTeamMembers(TEAMS).then((result) => {
	const teamMembers = result;

	getAllPullRequests(teamMembers)
		.then((data) => {
			exportToExcel('Pull Requests', data)
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
