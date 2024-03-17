import IMALUUMSCHEDULE from "./data.json";

// how-to:
// - GET /catalog
// - GET /catalog?subject=csci
// - GET /catalog?subject=mathematics

export async function GetCatalog(subject: string, limit?: number) {
	if (subject) {
		const schedules = IMALUUMSCHEDULE.filter(
			(schedule) =>
				schedule.code.toLowerCase().includes(subject.toLowerCase()) ||
				schedule.title.toLowerCase().includes(subject.toLowerCase()),
		);
		if (limit) {
			return schedules.slice(0, limit);
		}

		return schedules;
	}

	if (limit) {
		return IMALUUMSCHEDULE.slice(0, limit);
	}

	return IMALUUMSCHEDULE;
}
