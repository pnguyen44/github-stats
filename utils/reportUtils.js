const moment = require('moment');

function formatDate(dateString) {
	const formattedDate = moment(dateString).format('YYYY-MM-DD h:mm:ss A');
	return formattedDate;
}

module.exports = { formatDate };
