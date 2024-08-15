import type { Courses, Subject } from "@/types";
import got from "got";
import moment from "moment";
import { parse } from "node-html-parser";

const getScheduleFromSession = async (
  sessionQuery: string,
  sessionName: string,
  c: string,
): Promise<
  | {
    sessionQuery: string;
    sessionName: string;
    schedule: Subject[];
  }
  | undefined
> => {
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
    });

    const root = parse(response.body);

    const table = root.querySelector(".box-body table.table.table-hover");
    const rows = table?.querySelectorAll("tr");

    if (!rows) throw new Error("Failed to fetch schedule");

    const schedule = [];

    for (const row of rows) {
      const tds = row.querySelectorAll("td");

      if (tds.length === 0 || !tds) {
        continue;
      }

      // Check if tds array has enough elements
      if (tds.length === 9) {
        const courseCode = tds[0].textContent.trim();
        const courseName = tds[1].textContent.trim();
        const section = tds[2].textContent.trim();
        const chr = tds[3].textContent.trim();
        const days = tds[5].textContent
          .trim()
          .replace(/ /gi, "")
          .split("-")
          .map((x) => {
            if (x.includes("SUN")) return 0;
            if (x === "M" || x.includes("MON")) return 1;
            if (x === "T" || x.includes("TUE")) return 2;
            if (x === "W" || x.includes("WED")) return 3;
            if (x === "TH" || x.includes("THUR")) return 4;
            if (x === "F" || x.includes("FRI")) return 5;
            if (x.includes("SAT")) return 6;
          });
        if (!days) {
          continue;
        }

        // Split the days array if it has more than one item
        const splitDays = days.length > 1 ? [...days] : days;
        if (!splitDays) {
          continue;
        }

        const timetemp = tds[6].textContent;
        if (!timetemp) {
          continue;
        }

        const time = timetemp.trim().replace(/ /gi, "").split("-");

        let start: moment.Moment | string = moment(time[0], "Hmm");
        if (!start.isValid()) {
          continue;
        }
        start = start.format("HH:mm:ssZ");
        let end: moment.Moment | string = moment(time[1], "Hmm");
        if (!end.isValid()) {
          continue;
        }
        end = end.format("HH:mm:ssZ");

        const venue = tds[7].textContent.trim();
        const lecturer = tds[8].textContent.trim();

        // Add each split day as a separate entry in the schedule
        for (const splitDay of splitDays) {
          if (!splitDay) {
            continue;
          }
          schedule.push({
            id: `${courseCode}-${section}-${splitDays.indexOf(splitDay)}`,
            courseCode,
            courseName,
            section,
            chr,
            timestamps: { start, end, day: splitDay },
            venue,
            lecturer,
          });
        }
      }

      if (tds.length === 4) {
        const courseCode: string = schedule[schedule.length - 1].courseCode;
        const courseName: string = schedule[schedule.length - 1].courseName;
        const section: string = schedule[schedule.length - 1].section;
        const chr: string = schedule[schedule.length - 1].chr;
        const days = tds[0].textContent
          .trim()
          .replace(/ /gi, "")
          .split("-")
          .map((x) => {
            if (x.includes("SUN")) return 0;
            if (x === "M" || x.includes("MON")) return 1;
            if (x === "T" || x.includes("TUE")) return 2;
            if (x === "W" || x.includes("WED")) return 3;
            if (x === "TH" || x.includes("THUR")) return 4;
            if (x === "F" || x.includes("FRI")) return 5;
            if (x.includes("SAT")) return 6;
          });

        if (!days) {
          continue;
        }
        // Split the days array if it has more than one item
        const splitDays = days.length > 1 ? [...days] : days;
        if (!splitDays) {
          continue;
        }

        const timetemp = tds[1].textContent;
        if (!timetemp) {
          continue;
        }

        const time = timetemp.trim().replace(/ /gi, "").split("-");

        let start: moment.Moment | string = moment(time[0], "Hmm");
        if (!start.isValid()) {
          continue;
        }
        start = start.format("HH:mm:ssZ");
        let end: moment.Moment | string = moment(time[1], "Hmm");
        if (!end.isValid()) {
          continue;
        }
        end = end.format("HH:mm:ssZ");

        const venue = tds[2].textContent.trim();
        const lecturer = tds[3].textContent.trim();

        // Add each split day as a separate entry in the schedule
        for (const splitDay of splitDays) {
          if (!splitDay) {
            continue;
          }
          schedule.push({
            id: `${courseCode}-${section}-${splitDays.indexOf(splitDay)}`,
            courseCode,
            courseName,
            section,
            chr,
            timestamps: { start, end, day: splitDay },
            venue,
            lecturer,
          });
        }
      }
    }
    if (schedule && Array.isArray(schedule)) {
      // console.table(schedule);
      return { sessionQuery, sessionName, schedule };
    }
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
      },
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
      (sessionList as { sessionName: string; sessionQuery: string }[])
        .filter((session) => session !== undefined)
        .map(({ sessionName, sessionQuery }) =>
          getScheduleFromSession(sessionQuery, sessionName, c),
        ),
    );

    if (!results || results.length === 0) {
      throw new Error("Invalid schedule");
    }

    const resultData = [];
    for (const result of results) {
      if (!result) {
        continue;
      }
      resultData.push({
        schedule: result.schedule,
        sessionName: result.sessionName,
        sessionQuery: result.sessionQuery,
      });
    }

    if (resultData && Array.isArray(resultData)) {
      return {
        success: true,
        data: resultData,
      };
    }

    throw new Error("No schedule found");
  } catch (err) {
    console.log("err", err);
    throw new Error("Failed to fetch schedule");
  }
}
