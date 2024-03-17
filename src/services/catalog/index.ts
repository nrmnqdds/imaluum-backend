import IMALUUMSCHEDULE from "./data.json";

// how-to:
// - GET /catalog
// - GET /catalog?subject=csci
// - GET /catalog?subject=mathematics

export async function GetCatalog(subject: string) {
	if (subject) {
		const schedules = IMALUUMSCHEDULE.filter(
			(schedule) =>
				schedule.code.toLowerCase().includes(subject.toLowerCase()) ||
				schedule.title.toLowerCase().includes(subject.toLowerCase()),
		);
		return schedules;
	}

	return IMALUUMSCHEDULE;
}
