import moment from 'moment';
import { config } from '../config';

export function capitalizeFirstLetter(str) {
  const [firstLetter, ...rest] = str;
  return `${firstLetter.toUpperCase()}${rest.join('').toLowerCase()}`;
}

export function formatDate(dateString) {
  const formattedDate = moment(dateString).format(config.desiredDateFormat);
  return formattedDate;
}

export function isValidDateFormat(date, dateFormat) {
  return moment(date, dateFormat, true).isValid();
}

export function getRelativeDateRange(daysAgo) {
  const today = moment().toISOString();
  const startDate = moment().subtract(daysAgo, 'days').toISOString();
  console.log(
    'start',
    convertIosString(startDate, config.desiredDateFormat),
    'end',
    convertIosString(today, config.desiredDateFormat)
  );

  return { startDate, endDate: today };
}

export function convertIosString(date, dateFormat) {
  return moment(date, moment.ISO_8601).format(dateFormat);
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
  const holidays = config.holidays;
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
    return null;
  }

  const uniqueRequestsDates = [
    ...new Set(reviewRequests.map((request) => request.created_at)),
  ];

  const initialReviewedWithin24h = reviewRequestsDoneByDeadline(
    uniqueRequestsDates,
    filteredReviews,
    currentDateTime
  );

  if (uniqueRequestsDates.length === 1 || filteredReviews.length === 0) {
    return initialReviewedWithin24h;
  }

  const rerequestDates = uniqueRequestsDates.filter((date) => {
    const firstReviewedDate = moment(filteredReviews[0].submitted_at);
    if (moment(date).isAfter(firstReviewedDate)) {
      return true;
    }
  });

  const rerequestReviewedWithin24h = reviewRequestsDoneByDeadline(
    rerequestDates,
    filteredReviews,
    currentDateTime
  );

  if (
    initialReviewedWithin24h === false ||
    rerequestReviewedWithin24h === false
  ) {
    return false;
  }

  if (
    (initialReviewedWithin24h && rerequestReviewedWithin24h) ||
    (initialReviewedWithin24h && rerequestReviewedWithin24h === null)
  ) {
    return true;
  }

  return null;
}

function isReviewedByDeadline(
  relevantReviews,
  deadline,
  currentDateTime = moment()
) {
  // deadline date has not passed the current date time
  if (
    relevantReviews.length === 0 &&
    moment(deadline).isAfter(currentDateTime)
  ) {
    return null;
  }

  // deadline date has passed the current date time
  const doneWithin24hr = relevantReviews.filter((review) => {
    return moment(review.submitted_at).isSameOrBefore(deadline);
  });

  if (relevantReviews && doneWithin24hr.length === 0) {
    return false;
  }

  return true;
}

function reviewRequestsDoneByDeadline(
  reviewRequestDates,
  reviews,
  currentDateTime
) {
  if (reviewRequestDates.length === 0) {
    return null;
  }

  for (let i = 0; i < reviewRequestDates.length; i++) {
    const currentReviewRequest = moment(reviewRequestDates[i]);
    let deadline = getDeadline(currentReviewRequest);

    let relevantReviews = reviews;

    relevantReviews = relevantReviews.filter((review) => {
      return moment(review.submitted_at).isAfter(currentReviewRequest);
    });
    return isReviewedByDeadline(relevantReviews, deadline, currentDateTime);
  }
}

export function reviewedWithin24hrWithBreakdown(
  reviewRequests,
  reviews,
  currentDateTime
) {
  const filteredReviews = reviews.filter((r) => r.submitted_at);

  if (reviewRequests.length === 0) {
    return {
      initialReviewedWithin24h: null,
      rerequestReviewedWithin24h: null,
      totalRerequest: 0,
    };
  }

  const uniqueRequestsDates = [
    ...new Set(reviewRequests.map((request) => request.created_at)),
  ];

  const initialReviewedWithin24h = reviewRequestsDoneByDeadline(
    uniqueRequestsDates,
    filteredReviews,
    currentDateTime
  );

  if (uniqueRequestsDates.length === 1 || filteredReviews.length === 0) {
    return {
      initialReviewedWithin24h,
      rerequestReviewedWithin24h: null,
      totalRerequest: 0,
    };
  }

  const rerequestDates = uniqueRequestsDates.filter((date) => {
    const firstReviewedDate = moment(filteredReviews[0].submitted_at);
    if (moment(date).isAfter(firstReviewedDate)) {
      return true;
    }
  });

  const rerequestReviewedWithin24h = reviewRequestsDoneByDeadline(
    rerequestDates,
    filteredReviews,
    currentDateTime
  );

  return {
    initialReviewedWithin24h,
    rerequestReviewedWithin24h,
    totalRerequest: rerequestDates.length,
  };
}

export function resolveDateRange(startDate, endDate, startDaysAgo) {
  if (startDate && endDate && startDaysAgo) {
    throw new Error('Invalid combination of absolute and relative date range');
  }

  if ((startDate && !endDate) || (endDate && !startDate)) {
    throw new Error('Absolute range require both start and end dates');
  }

  if (
    startDate &&
    endDate &&
    (!isValidDateFormat(startDate, config.desiredDateFormat) ||
      !isValidDateFormat(endDate, config.desiredDateFormat))
  ) {
    throw new Error('Dates must be in `YYYY-MM-DD hh:mm:ss A format`');
  }

  if (startDate && endDate) {
    startDate = moment(startDate, config.desiredDateFormat).toISOString();
    endDate = moment(endDate, config.desiredDateFormat).toISOString();
    return { startDate, endDate };
  }

  if (startDaysAgo > 0) {
    return getRelativeDateRange(startDaysAgo);
  }

  return {};
}

export function bucketDataByInterval({
  data,
  startDate,
  endDate,
  daysInterval,
}) {
  const dateFormat = config.desiredDateFormat;
  const buckets = [];
  startDate = moment(convertIosString(startDate, dateFormat), dateFormat);
  endDate = moment(convertIosString(endDate, dateFormat), dateFormat);

  let currentDate = startDate;

  while (currentDate.isBefore(moment(endDate, dateFormat).add(1, 'seconds'))) {
    const end = moment(currentDate, dateFormat)
      .add(daysInterval, 'days')
      .subtract(1, 'seconds');

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
    currentDate = end.add(1, 'seconds');
  }
  return buckets;
}
