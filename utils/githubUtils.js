const { Octokit } = require('@octokit/rest');

const { OWNER, PER_PAGE, TOKEN } = require('../config');

const octokit = new Octokit({
	auth: TOKEN,
});

const headers = {
	'X-GitHub-Api-Version': '2022-11-28',
};

async function getTeamMembers(page, team) {
	try {
		const response = await octokit.request(
			'GET /orgs/{org}/teams/{team_slug}/members',
			{
				org: OWNER,
				team_slug: team,
				per_page: PER_PAGE,
				page,
				headers,
			}
		);
		const { data } = response;
		result = data.map((d) => d.login);
		return result;
	} catch (err) {
		console.log('Error in getting team members', err);
	}
}

async function getAllTeamMembers(teams) {
	let result = [];
	let data;
	for (const team of teams) {
		data = await paginate(getTeamMembers, team);
		result = result.concat(data);
	}
	const unique = [...new Set(result)];
	console.log('team members', unique.length);
	return unique;
}

async function getRepos(page, team) {
	console.log('get repo page', page);
	try {
		const response = await octokit.request(
			'GET /orgs/{org}/teams/{team_slug}/repos',
			{
				org: OWNER,
				team_slug: team,
				per_page: PER_PAGE,
				page,
				headers,
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

async function getAllReposForTeams(teams) {
	console.log('Getting repos for teams');

	let result = [];
	let data;

	for (const team of teams) {
		console.log('Getting repos for team:', team);
		data = await paginate(getRepos, team);
		result = result.concat(data);
	}

	const unique = [...new Set(result)];
	console.log('total repos', unique.length);
	return unique;
}

async function getRepo(repo) {
	try {
		const response = await octokit.request('GET /repos/{owner}/{repo}', {
			owner: OWNER,
			repo,
			headers,
		});

		const { data } = response;
		// console.log(data);
		console.log(response.status);
	} catch (error) {
		console.error('Error fetching repo:', error);
	}
}

async function getRepoPullRequests(page = 1, teamMembers, repo) {
	console.log('get pull request: repo=', repo, 'page=', page);

	try {
		const response = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
			owner: OWNER,
			per_page: PER_PAGE,
			page,
			repo,
			headers,
		});

		const { data } = response;

		result = data
			.filter((d) => {
				const { login } = d.user;
				return teamMembers.includes(login);
			})
			.map((d) => {
				const {
					html_url,
					state,
					title,
					user,
					created_at,
					updated_at,
					requested_teams,
					requested_reviewers,
				} = d;
				const { login } = user;

				const requestedTeam = requested_teams.map((r) => r.name);
				const requestedReviewers = requested_reviewers.map((r) => r.login);

				return {
					created_at,
					updated_at,
					state,
					user: login,
					title,
					html_url,
					requested_teams: requestedTeam,
					requested_reviewers: requestedReviewers,
				};
			});

		return result;
	} catch (error) {
		console.error('Error fetching repository pull requests:', error);
	}
}

async function paginate(func, ...args) {
	let result = [];
	let page = 0;
	let data;

	do {
		page += 1;
		data = await func(page, ...args);
		result = result.concat(data);
	} while (data.length > 0);

	return result;
}

module.exports = {
	paginate,
	getRepos,
	getRepo,
	getRepoPullRequests,
	getAllTeamMembers,
	getAllReposForTeams,
};
