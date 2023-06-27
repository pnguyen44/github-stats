import moment from 'moment';
import { HOLIDAYS, DESIRED_DATE_FORMAT } from '../config';

export function formatDate(dateString) {
  const formattedDate = moment(dateString).format(DESIRED_DATE_FORMAT);
  return formattedDate;
}

export function getRelativeDateRange(daysAgo) {
  const today = moment().format('YYYY-MM-DD');
  const startDate = moment().subtract(daysAgo, 'days').format('YYYY-MM-DD');
  console.log('start', startDate, 'end', today);

  return { startDate, endDate: today };
}

export function isStringConvertibleToDate(value) {
  return !isNaN(Date.parse(value));
}

export function sortDataByField(data, field, sortDirection) {
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

export function getDeadline(date) {
  const dateMoment = moment(date);
  const holidays = HOLIDAYS;
  const isFriday = dateMoment.format('dddd') === 'Friday';

  let days = 0;

  if (isFriday) {
    days = 3;
  } else {
    days = 1;
  }
  let deadline = dateMoment.add(days, 'days');

  const isHoliday = (date) => {
    return holidays.includes(moment(date).format('YYYY-MM-DD'));
  };

  while (isHoliday(deadline)) {
    deadline.add(1, 'days');
  }
  return deadline;
}

export function reviewedWithin24hrs(reviewRequests, reviews, currentDateTime) {
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

  const uniqueRequestsDates = [
    ...new Set(reviewRequests.map((request) => request.created_at)),
  ];

  for (let i = 0; i < uniqueRequestsDates.length; i++) {
    const current = moment(uniqueRequestsDates[i]);
    let deadline = getDeadline(current);

    let relevantReviews = filteredReviews;

    if (uniqueRequestsDates.length > 1) {
      relevantReviews = filteredReviews.filter((reviews) => {
        return moment(reviews.submitted_at).isAfter(current);
      });
    }

    const doneWithin24hr = relevantReviews.filter((review) => {
      return moment(review.submitted_at).isSameOrBefore(deadline);
    });

    if (relevantReviews && doneWithin24hr.length === 0) {
      return false;
    }

    const lastRequest = i === uniqueRequestsDates.length - 1;

    if (
      lastRequest &&
      relevantReviews.length > 0 &&
      doneWithin24hr.length > 0
    ) {
      return true;
    }
  }

  return '';
}

export function resolveDateRange({ startDate, endDate, startDaysAgo }) {
  if (startDate && endDate && startDaysAgo) {
    throw new Error('Invalid combination of absolute and relative date range');
  }

  if ((startDate && !endDate) || (endDate && !startDate)) {
    throw new Error('Absolute range require both start and end dates');
  }

  if (startDaysAgo > 0) {
    return getRelativeDateRange(startDaysAgo);
  }

  if (startDate && endDate) {
    return { startDate, endDate };
  }

  return {};
}

export function bucketDataByInterval({
  data,
  startDate,
  endDate,
  daysInterval,
}) {
  const dateFormat = DESIRED_DATE_FORMAT;
  const buckets = [];
  let currentDate = moment(startDate, dateFormat);

  while (currentDate.isSameOrBefore(moment(endDate, dateFormat))) {
    const end = moment(currentDate, dateFormat)
      .add(daysInterval - 1, 'days')
      .endOf('day');
    const relevantData = data.filter((item) =>
      moment(item.created_at, dateFormat).isBetween(
        currentDate,
        end,
        undefined,
        '[]'
      )
    );
    buckets.push({
      start: currentDate.format(dateFormat),
      end: end.format(dateFormat),
      data: relevantData,
    });
    currentDate = end.add(1, 'days').startOf('day');
  }
  return buckets;
}
