// import { apiReference } from "@scalar/hono-api-reference";
import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import OpenAPIDefinition from "./openapi/definition.json";
import { GetAds } from "./services/ads";
import { GetCatalog } from "./services/catalog";
import { ImaluumLogin } from "./services/login";
import { GetProfile } from "./services/profile";
import { GetResult } from "./services/result";
import { GetSchedule } from "./services/schedule";

const app = new Hono();

const customLogger = (message: string, ...rest: string[]) => {
	console.log(message, ...rest);
};

app.use(prettyJSON());
app.use(logger(customLogger));
app.use(
	"*",
	cors({
		origin: "https://imaluum.iium.edu.my",
		allowMethods: ["GET", "POST"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

// app.get(
//   "/",
//   apiReference({
//     spec: {
//       url: "/doc",
//     },
//   }),
// );

app.get("/", swaggerUI({ url: "/doc" }));

app.get("/doc", (c) => {
	return c.json(OpenAPIDefinition);
});

app.post("/login", async (c) => {
	try {
		console.time("login");
		const body = await c.req.json();

		if (!body || !body.username || !body.password) {
			return c.json({
				success: false,
				message: "Please provide username and password",
			});
		}
		const res = await ImaluumLogin(body);
		if (res.success && res.cookies) {
			for (const cookie of res.cookies) {
				setCookie(c, cookie.key, cookie.value, {
					expires: new Date(Date.now() + 10 * 60 * 1000),
				});
			}
		}

		return c.json(res);
	} catch (err) {
		return c.json({
			success: false,
			message: "Invalid username or password",
		});
	} finally {
		console.timeEnd("login");
	}
});

app.get("/profile", async (c) => {
	try {
		const cookie = getCookie(c, "MOD_AUTH_CAS");
		if (!cookie) {
			throw new Error("No cookies provided!");
		}
		const res = await GetProfile(`MOD_AUTH_CAS=${cookie}`);
		return c.json(res);
	} catch (err) {
		return c.json({
			success: false,
			message: "Failed to get profile. Please login first.",
		});
	}
});

app.get("/schedule", async (c) => {
	try {
		// const cookies = c.req.header("Cookie");
		const cookie = getCookie(c, "MOD_AUTH_CAS");
		if (!cookie) {
			throw new Error("No cookies provided!");
		}
		const res = await GetSchedule(`MOD_AUTH_CAS=${cookie}`);
		return c.json(res);
	} catch (err) {
		return c.json({
			success: false,
			message: "Failed to get schedule. Please login first.",
		});
	}
});

app.get("/result", async (c) => {
	try {
		const cookie = getCookie(c, "MOD_AUTH_CAS");
		if (!cookie) {
			throw new Error("No cookies provided!");
		}

		const res = await GetResult(`MOD_AUTH_CAS=${cookie}`);
		return c.json(res);
	} catch (err) {
		return c.json({
			success: false,
			message: "Failed to get result. Please login first.",
		});
	}
});

app.get("/catalog", async (c) => {
	const { subject, limit } = c.req.query();
	const data = await GetCatalog(subject, Number.parseInt(limit, 10));

	return c.json(data);
});

app.get("/ads", async (c) => {
	const data = await GetAds();

	return c.json(data);
});

// export const handler = handle(app);

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});
