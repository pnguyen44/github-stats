import dotenv from 'dotenv';
dotenv.config();

export const OWNER = 'simplisafe';
export const TEAMS = ['camfam', 'cloud-ai'];
export const PER_PAGE = 20;
export const MAX_PAGE = 1;
export const TOKEN = process.env.TOKEN;

if (TOKEN === '') {
  console.error('Missing token in .env');
}
