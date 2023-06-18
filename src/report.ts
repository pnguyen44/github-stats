import {
  getRepoPullRequests,
  getAllTeamMembers,
  getAllReposForTeams,
  paginate,
} from '../src/utils/githubUtils';
import { exportToExcel } from '../src/utils/exportUtils';
import { sortDataByField } from '../src/utils/reportUtils';
import { PR_STATE } from './constant';

import { TEAMS } from '../src/config';

async function getAllPullRequests(
  teamMembers: string[],
  state = PR_STATE.open
) {
  console.log('Getting all pull requests');

  const repos = await getAllReposForTeams(TEAMS);

  let result: Array<Record<string, any>> = [];

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

function createPullRequestsReport(name: string, state = PR_STATE.open) {
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

createPullRequestsReport('Open PRs', PR_STATE.open);
