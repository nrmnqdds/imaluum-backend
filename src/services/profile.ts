import got from "got";
import { parse } from "node-html-parser";

export async function GetProfile(c: string) {
	try {
		const response = await got("https://imaluum.iium.edu.my/Profile", {
			headers: {
				Cookie: c,
			},
			https: { rejectUnauthorized: false },
			followRedirect: false,
		});

		const root = parse(response.body);
		// const _name = root.querySelector(
		//   ".row .col-md-12 .box.box-default .panel-body.row .col-md-4[style='text-align:center; padding:10px; floaf:left;'] h4[style='margin-top:1%;']",
		// );

		const _name = root.querySelector(
			".navbar-custom-menu ul.nav.navbar-nav li.dropdown.user.user-menu span.hidden-xs",
		);
		// const _matricNo = root.querySelector(
		// 	".row .col-md-12 .box.box-default .panel-body.row .col-md-4[style='margin-top:1%;'] h4",
		// );

		// if (!_name || !_matricNo) {
		// 	// Check if the selectors were found
		// 	throw new Error("Selectors not found on the page.");
		// }

		if (!_name) {
			throw new Error("Selectors not found on the page.");
		}

		const name = _name.textContent?.trim();
		// const matricNo = _matricNo.textContent?.trim().split("|")[0].trim();
		// const imageURL = `https://corsproxy.io/?https://smartcard.iium.edu.my/packages/card/printing/camera/uploads/original/${matricNo}.jpeg`;

		return {
			success: true,
			data: {
				// imageURL,
				name,
				// matricNo,
			},
		};
	} catch (err) {
		throw new Error("Failed to fetch user profile");
	}
}
