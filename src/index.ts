import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { ImaluumLogin } from "./scraper/login";
import { GetSchedule } from "./scraper/schedule";
import { setCookie, getCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

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
    quickstart: "Try to login by making a POST request to /login",
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

  const res = await GetSchedule(cookies);

  return c.json(res);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
