require('dotenv').config();

const OWNER = 'simplisafe';
const TEAMS = ['camfam', 'cloud-ai'];
const PER_PAGE = 20;
const MAX_PAGE = 1;
const TOKEN = process.env.TOKEN;

if (TOKEN == '') {
  console.error('Missing token in .env');
}

const HOLIDAYS = [
  '2023-01-02',
  '2023-02-20',
  '2023-03-17', // recharge day
  '2023-04-17', // recharge day
  '2023-05-29',
  '2023-06-19',
  '2023-07-04',
  '2023-09-04',
  '2023-10-09',
  '2023-11-23',
  '2023-12-25',
];

module.exports = { OWNER, TEAMS, PER_PAGE, TOKEN, MAX_PAGE, HOLIDAYS };
