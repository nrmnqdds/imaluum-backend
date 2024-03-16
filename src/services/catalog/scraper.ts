const fs = require("fs");

const KULY = [
	"KAHS",
	"AED",
	"BRIDG",
	"CFL",
	"CCAC",
	"DENT",
	"EDUC",
	"ENGIN",
	"ECONS",
	"KICT",
	"IHART",
	"IRKHS",
	"IIBF",
	"ISTAC",
	"KLM",
	"LAWS",
	"NURS",
	"PHARM",
	"KOS",
	"SC4SH",
];

const session = "2023_2024";
const semester = 2;

async function main() {
	console.time("fetching");
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const allData: any[] = []; // Array to store data for each kuly

	// Create an array of promises for each fetch request
	const fetchPromises = KULY.map(async (kuly) => {
		const res = await fetch(
			`https://raw.githubusercontent.com/iqfareez/albiruni_fetcher/master/db/${session}/${semester}/${kuly}.json`,
		);
		const data = await res.json();

		if (data.length > 0) {
			const ses = "2023/2024";
			const sem = 2;
			for (const x of data) {
				// ---data cleaning---

				if (x.dayTime.length === 0) continue;

				// ---data cleaning---

				const timestamps = [];
				for (const y of x.dayTime) {
					timestamps.push({
						day: y.day,
						start: y.startTime,
						end: y.endTime,
					});
				}
				allData.push({
					code: x.code,
					title: x.title,
					section: x.sect,
					creditHours: x.chr,
					lecturer: x.lect,
					venue: x.venue,
					weekTimes: timestamps,
				});
			}
		}
	});

	// Wait for all promises to resolve
	await Promise.all(fetchPromises);

	// Write the data to a file
	const jsonData = JSON.stringify(allData, null, 2);

	fs.writeFileSync("./data.json", jsonData);

	console.timeEnd("fetching");
}

main();
