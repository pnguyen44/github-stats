const moment = require('moment');

function formatDate(dateString) {
  const formattedDate = moment(dateString).format('YYYY-MM-DD h:mm:ss A');
  return formattedDate;
}

function isStringConvertibleToDate(value) {
  return !isNaN(Date.parse(value));
}

function sortDataByField(data, field, sortDirection) {
  const sortedArray = data.slice().sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    if (isStringConvertibleToDate(aVal)) {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    if (sortDirection === 'asc') {
      return aVal - bVal;
    } else if (sortDirection === 'desc') {
      return bVal - aVal;
    } else {
      throw new Error(
        'Invalid sort direction. Please specify either "asc" or "desc".'
      );
    }
  });

  return sortedArray;
}

module.exports = { formatDate, sortDataByField };
