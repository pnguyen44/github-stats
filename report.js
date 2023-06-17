const {
	getRepoPullRequests,
	getAllTeamMembers,
	getAllReposForTeams,
	paginate,
} = require('./utils/githubUtils');
const { exportToExcel } = require('./utils/exportUtils');
const { sortDataByField } = require('./utils/reportUtils');
const { PR_STATE } = require('./constant');

const { TEAMS } = require('./config');

async function getAllPullRequests(teamMembers, state = PR_STATE.open) {
	console.log('Getting all pull requests');

	const repos = await getAllReposForTeams(TEAMS);

	let result = [];

	for (const repo of repos) {
		const pullRequests = await paginate(
			getRepoPullRequests,
			teamMembers,
			repo,
			state
		);
		result = result.concat(pullRequests);
	}
	return result;
}

function createPullRequestsReport(name, state = PR_STATE.open) {
	getAllTeamMembers(TEAMS).then((result) => {
		const teamMembers = result;

		getAllPullRequests(teamMembers, state)
			.then((data) => {
				const sortedData = sortDataByField(data, 'created_at', 'asc');

				exportToExcel(name, sortedData)
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
}

createPullRequestsReport('All PRs', PR_STATE.all);
