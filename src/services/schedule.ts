"use server";

import got, { type GotBodyOptions } from "got";
import moment from "moment";
import { parse } from "node-html-parser";

const getSchedule = async (
	sessionQuery: string,
	sessionName: string,
	c: string,
): Promise<{
	sessionQuery: string;
	sessionName: string;
	schedule: Subject[];
}> => {
	const url = `https://imaluum.iium.edu.my/MyAcademic/schedule${sessionQuery}`;

	if (!c) {
		throw new Error("Please login first!");
	}

	try {
		const response = await got(url, {
			headers: {
				Cookie: c,
			},
			https: { rejectUnauthorized: false },
			followRedirect: false,
		} as GotBodyOptions<string>);

		const root = parse(response.body);

		const table = root.querySelector(".box-body table.table.table-hover");
		const rows = table?.querySelectorAll("tr");

		if (!rows) throw new Error("Failed to fetch schedule");

		const schedule = [];

		for (const row of rows) {
			const tds = row.querySelectorAll("td");

			// Check if tds array has enough elements
			if (tds.length >= 9) {
				const courseCode = tds[0].textContent.trim();
				const courseName = tds[1].textContent.trim();
				const section = parseInt(tds[2].textContent.trim(), 10).toString();
				const chr = parseInt(tds[3].textContent.trim(), 10).toString();
				const days = tds[5].textContent
					.trim()
					.replace(/ /gi, "")
					.split("-")
					.map((x) => {
						if (x === "M" || x === "MON") return 1;
						if (x === "T" || x === "TUE") return 2;
						if (x === "W" || x === "WED") return 3;
						if (x === "TH" || x === "THUR") return 4;
						if (x === "F" || x === "FRI") return 5;
					});

				// Split the days array if it has more than one item
				const splitDays = days.length > 1 ? [...days] : days;
				const time = tds[6].textContent.trim().replace(/ /gi, "").split("-");

				if (time.length === 0) continue;

				const start = moment(time[0], "Hmm").format("HH:mm:ssZ").toString();
				const end = moment(time[1], "Hmm").format("HH:mm:ssZ").toString();
				const venue = tds[7].textContent.trim();
				const lecturer = tds[8].textContent.trim();

				// Add each split day as a separate entry in the schedule
				for (const splitDay of splitDays) {
					schedule.push({
						id: `${courseCode}-${section}-${splitDays.indexOf(splitDay)}`,
						courseCode,
						courseName,
						section,
						chr,
						timestamps: [{ start, end, day: splitDay }],
						venue,
						lecturer,
					});
				}
			}
		}

		return { sessionQuery, sessionName, schedule };
	} catch (err) {
		console.log("err", err);
		throw new Error("Failed to fetch schedule");
	}
};

export async function GetSchedule(c: string): Promise<{
	success: boolean;
	data: Courses[];
}> {
	try {
		const response = await got(
			"https://imaluum.iium.edu.my/MyAcademic/schedule",
			{
				headers: {
					Cookie: c,
				},
				https: { rejectUnauthorized: false },
				followRedirect: false,
			} as GotBodyOptions<string>,
		);

		const root = parse(response.body);

		const sessionBody = root.querySelectorAll(
			".box.box-primary .box-header.with-border .dropdown ul.dropdown-menu li[style*='font-size:16px']",
		);

		const sessionList = sessionBody.map((element) => {
			const row = element;
			const sessionName = row.querySelector("a")?.textContent.trim();
			const sessionQuery = row.querySelector("a")?.getAttribute("href");
			return { sessionName, sessionQuery };
		});

		const results = await Promise.all(
			sessionList.map(({ sessionQuery, sessionName }) =>
				getSchedule(sessionQuery as string, sessionName as string, c as string),
			),
		);

		const resultData = results.map((result) => ({
			schedule: result.schedule,
			sessionName: result.sessionName,
			sessionQuery: result.sessionQuery,
		}));

		return {
			success: true,
			data: resultData,
		};
	} catch (err) {
		console.log("err", err);
		throw new Error("Failed to fetch schedule");
	}
}
