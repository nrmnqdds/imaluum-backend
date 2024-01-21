import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { ImaluumLogin } from "./scraper/login";
import { GetSchedule } from "./scraper/schedule";
import { setCookie, getCookie } from "hono/cookie";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/login", async (c) => {
  const body = await c.req.json();

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

  return c.json(res.matricNo);
});

app.get("/schedule", async (c) => {
  const cookies = c.req.header("Cookie");
  if (!cookies) {
    throw new Error("No cookies provided!");
  }

  console.log("cookies is:", cookies);
  const res = await GetSchedule(cookies);

  return c.json(res);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
