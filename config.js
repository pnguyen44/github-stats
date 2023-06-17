require('dotenv').config();

const OWNER = 'simplisafe';
const TEAMS = ['camfam', 'cloud-ai'];
const PER_PAGE = 20;
const MAX_PAGE = 1
const TOKEN = process.env.TOKEN;

if (TOKEN == '') {
	console.error('Missing token in .env');
}

module.exports = { OWNER, TEAMS, PER_PAGE, TOKEN , MAX_PAGE};
