/*Return current unix timestamp */
const unix_ts_now_notime = () => {
	return Math.floor(+new Date(new Date().toLocaleString('fr-CA', { dateStyle: 'short' })) / 1000);
};

const unix_ts_now = () => {
	return Math.floor(+new Date() / 1000);
};

const unix_ts_end = () => {
	return Math.floor(+new Date('2200-01-01 00:00:00') / 1000);
};

const convert_date_unix_ts = (date: Date) => {
	return Math.floor(+new Date(date) / 1000);
};

const mongo_ts_opts = {
	toObject: { virtuals: true },
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at', currentTime: () => unix_ts_now() }
};

function addDays(days: number) {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return date;
}

export { unix_ts_now_notime, unix_ts_now, unix_ts_end, convert_date_unix_ts, addDays, mongo_ts_opts };
