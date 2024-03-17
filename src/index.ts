import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { GetCatalog } from "./services/catalog";
import { ImaluumLogin } from "./services/login";
import { GetResult } from "./services/result";
import { GetSchedule } from "./services/schedule";

const app = new Hono();

app.use("*", prettyJSON());
app.use("*", cors());

app.get("/", (c) => {
	return c.json({
		title: "Welcome to i-Ma'luum Backend!",
		description: [
			"A scraper to get i-Ma'luum data for good purposes.",
			"Instruction for usage is available at the github repository.",
			"Any contribution is welcomed!",
			"This project is not affiliated with IIUM.",
		],
		author: "@nrmnqdds",
		github: "https://github.com/nrmnqdds/imaluum-backend",
		quickstart: [
			"POST /login {username, password}",
			"GET /schedule",
			"GET /result",
			"GET /catalog",
			"GET /catalog?subject=csci",
		],
	});
});

app.post("/login", async (c) => {
	const body = await c.req.json();

	if (!body.username || !body.password) {
		return c.json({
			success: false,
			message: "Please provide username and password",
		});
	}

	try {
		const res = await ImaluumLogin(body);
		if (res.success && res.cookies) {
			for (const cookie of res.cookies) {
				// console.log(cookie);
				if (cookie.key === "MOD_AUTH_CAS") {
					setCookie(c, "MOD_AUTH_CAS", cookie.value, {
						expires: new Date(Date.now() + 10 * 60 * 1000),
					});
					break;
				}
			}
		}

		return c.json(res);
	} catch (err) {
		return c.json({
			success: false,
			message: "Invalid username or password",
		});
	}
});

app.get("/schedule", async (c) => {
	const cookies = c.req.header("Cookie");
	if (!cookies) {
		throw new Error("No cookies provided!");
	}
	try {
		const res = await GetSchedule(cookies);
		return c.json(res);
	} catch (err) {
		return c.json({
			success: false,
			message: "Failed to get schedule. Please login first.",
		});
	}
});

app.get("/result", async (c) => {
	const cookies = c.req.header("Cookie");
	if (!cookies) {
		throw new Error("No cookies provided!");
	}

	try {
		const res = await GetResult(cookies);
		return c.json(res);
	} catch (err) {
		return c.json({
			success: false,
			message: "Failed to get result. Please login first.",
		});
	}
});

app.get("/catalog", async (c) => {
	const { subject } = c.req.query();
	const data = await GetCatalog(subject);

	return c.json(data);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});
