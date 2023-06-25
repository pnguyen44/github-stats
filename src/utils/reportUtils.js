const moment = require('moment');

function formatDate(dateString) {
  const formattedDate = moment(dateString).format('YYYY-MM-DD h:mm:ss A');
  return formattedDate;
}

function getRelativeDateRange(daysAgo) {
  const today = moment().format('YYYY-MM-DD');
  const startDate = moment().subtract(daysAgo, 'days').format('YYYY-MM-DD');
  console.log('start', startDate, 'end', today);

  return { startDate, endDate: today };
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

function getDeadline(date) {
  const dateMoment = moment(date);
  const isFriday = dateMoment.format('dddd') === 'Friday';
  let deadline;
  if (isFriday) {
    deadline = dateMoment.add(72, 'hours');
  } else {
    deadline = dateMoment.add(24, 'hours');
  }

  return deadline;
}

function reviewedWithin24hrs(reviewRequests, reviews, currentDateTime) {
  const filteredReviews = reviews.filter((r) => r.submitted_at);

  if (reviewRequests.length === 0) {
    return '';
  }

  if (
    filteredReviews.length === 0 &&
    getDeadline(reviewRequests[0].created_at) > currentDateTime
  ) {
    return '';
  }

  const uniqueRequestsDates = Array.from(
    new Set(reviewRequests.map((request) => request.created_at))
  );

  // console.log('uniqueRequestsDates', uniqueRequestsDates);

  for (let i = 0; i < uniqueRequestsDates.length; i++) {
    const current = moment(uniqueRequestsDates[i]);
    let deadline = getDeadline(current);

    let relevantReviews = filteredReviews;

    if (uniqueRequestsDates.length > 1) {
      relevantReviews = filteredReviews.filter((reviews) => {
        return moment(reviews.submitted_at).isAfter(current);
      });
    }
    // console.log('relevant reviews', relevantReviews);
    // console.log('deadline', deadline.toISOString());

    const doneWithin24hr = relevantReviews.filter((review) => {
      return moment(review.submitted_at).isSameOrBefore(deadline);
    });

    // console.log('doneWithin24hr', doneWithin24hr);

    if (relevantReviews && doneWithin24hr.length === 0) {
      return 'no';
    }

    const lastRequest = i === uniqueRequestsDates.length - 1;

    if (
      lastRequest &&
      relevantReviews.length > 0 &&
      doneWithin24hr.length > 0
    ) {
      return 'yes';
    }
  }

  return '';
}

module.exports = {
  formatDate,
  sortDataByField,
  getRelativeDateRange,
  reviewedWithin24hrs,
};
