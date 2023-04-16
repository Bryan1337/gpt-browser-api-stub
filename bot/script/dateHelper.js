
export const isDateObject = (dateString) => {

	try {

		const dateObject = new Date(Date.parse(dateString));

		if (isNaN(dateObject)) {

			return false;
		}

		return true;

	} catch (e) {

		return false;
	}
}