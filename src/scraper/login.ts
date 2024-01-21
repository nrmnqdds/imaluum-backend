"use server";

import got from "got";
import type { GotBodyOptions } from "got";
import { CookieJar } from "tough-cookie";

export async function ImaluumLogin(form: {
  username: string;
  password: string;
}) {
  const cookieJar = new CookieJar();

  const payload = new URLSearchParams({
    username: form.username,
    password: form.password,
    execution: "e1s1",
    _eventId: "submit",
    geolocation: "",
  });

  try {
    await got(
      "https://cas.iium.edu.my:8448/cas/login?service=https%3a%2f%2fimaluum.iium.edu.my%2fhome",
      {
        cookieJar,
        https: { rejectUnauthorized: false },
        followRedirect: false,
      } as GotBodyOptions<string>
    );

    const { headers } = await got.post(
      "https://cas.iium.edu.my:8448/cas/login?service=https%3a%2f%2fimaluum.iium.edu.my%2fhome?service=https%3a%2f%2fimaluum.iium.edu.my%2fhome",
      {
        cookieJar,
        https: { rejectUnauthorized: false },
        body: payload.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Referer:
            "https://cas.iium.edu.my:8448/cas/login?service=https%3a%2f%2fimaluum.iium.edu.my%2fhome",
        },
        followRedirect: false,
      } as GotBodyOptions<string>
    );

    await got(
      headers.location as string,
      {
        cookieJar,
        https: { rejectUnauthorized: false },
        followRedirect: false,
      } as GotBodyOptions<string>
    );

    const cookieStore = cookieJar.toJSON().cookies;

    if (cookieStore.length === 0) {
      return {
        success: false,
        message: "Invalid username or password",
      };
    }

    // for (const cookie of cookieStore) {
    //   // console.log(cookie);
    //   if (cookie.key === "MOD_AUTH_CAS") {
    //     // cookies().set({
    //     //   name: "MOD_AUTH_CAS",
    //     //   value: cookie.value,
    //     //   expires: new Date(Date.now() + 10 * 60 * 1000),
    //     // });
    //     setCookie(c, "MOD_AUTH_CAS", cookie.value, {
    //       expires: new Date(Date.now() + 10 * 60 * 1000),
    //     });
    //     break;
    //   }
    // }
    return {
      success: true,
      matricNo: form.username,
      cookies: cookieStore,
    };
  } catch (err) {
    console.log(err);
    throw new Error("Error logging in");
  }
}
