require('dotenv').config();

const OWNER = 'simplisafe';
const TEAMS = ['camfam', 'cloud-ai'];
const PER_PAGE = 100;
const TOKEN = process.env.TOKEN;

if (TOKEN == '') {
	console.error('Missing token in .env');
}

module.exports = { OWNER, TEAMS, PER_PAGE, TOKEN };
