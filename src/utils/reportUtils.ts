import moment from 'moment';

export function formatDate(dateString: string): string {
  const formattedDate = moment(dateString).format('YYYY-MM-DD h:mm:ss A');
  return formattedDate;
}

function isStringConvertibleToDate(value: string): boolean {
  return !isNaN(Date.parse(value));
}

export function sortDataByField(
  data: Record<string, any>[],
  field: string,
  sortDirection: 'asc' | 'desc'
): Record<string, any>[] {
  const sortedArray = data.slice().sort((a, b) => {
    let aVal: any = a[field];
    let bVal: any = b[field];

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
