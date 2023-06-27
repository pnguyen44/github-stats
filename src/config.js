import dotenv from 'dotenv';
dotenv.config();

export const OWNER = 'simplisafe';
export const TEAMS = ['camfam', 'cloud-ai'];
export const TOKEN = process.env.TOKEN;
export const DESIRED_DATE_FORMAT = 'YYYY-MM-DD h:mm:ss A';

if (TOKEN == '') {
  console.error('Missing token in .env');
}

export const HOLIDAYS = [
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
