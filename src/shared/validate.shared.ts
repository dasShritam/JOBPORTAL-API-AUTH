import * as moment from 'moment';

export const isValidDate = (date: string) => {
	const format = 'YYYY-MM-DD';
	const validDate = moment(date, format, true).isValid();
	return validDate;
};
