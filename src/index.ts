import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { GetCatalog } from "./services/catalog";
import { ImaluumLogin } from "./services/login";
import { GetResult } from "./services/result";
import { GetSchedule } from "./services/schedule";
import OpenAPIDefinition from "./openapi/definition.json"

const app = new Hono();

app.use("*", prettyJSON());
app.use("*", cors());

app.get("/", swaggerUI({ url: "/doc" }));

app.get("/doc", (c)=> {
	return c.json(OpenAPIDefinition)
})

app.post("/login", async (c) => {
	try {
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
	try {
		// const cookies = c.req.header("Cookie");
		const cookie = getCookie(c, 'MOD_AUTH_CAS')
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
		const cookie = getCookie(c, 'MOD_AUTH_CAS')
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
	const data = await GetCatalog(subject, parseInt(limit, 10));

	return c.json(data);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});
