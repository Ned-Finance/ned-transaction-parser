import fetch from "cross-fetch";
import { describe } from "mocha";
import SolanaParser from "../src";
import { getConnection } from "./utils/connection";

async function General() {
	it("Parse a transaction from tx id", async function () {
		const connection = getConnection();

		const tokens = await (await fetch("https://token.jup.ag/all")).json();

		const solanaParser = new SolanaParser({
			connection,
			walletAddress: "8uqKsED1fpqAtPrPVV84m1Rxd9gmQ63LZxeRP5L3LyRK",
			tokens,
		});

		// [
		// 	"3iHGaDXBdkSZq2GXaXgJiWxKXBbPTHfvZWdcUDpZmRHBRA1NnernkwHwfGMmLduSoxY7cJkvwWd3CSyjPeNx8N1o",
		// 	"4LJy5wrs5oz4mAeA6q4WPDY9RrNVekBqxBQDG4oDReXbNPANWBhrhBDADinvY7tSe24Srvm7Bb8z34whwf4DWyiz",
		// 	"2HnPP2rogRJwxGsbXi8MwVDGYxCaVaKVDUq11jidqCdS6m7AMhJvFpozAkTXSSh52rZFjrtkLtt7yxPffcAGVG27",
		// 	"296m1KTu4CxAfUjsrpHi83UfAKE48fkmUaac9sxFQt5fd4RoscYhwT5BbphwVXR8V1M6PgoBF1vBDTwbY3sKupgT",
		// 	"539vjwCZNzDGKbe3VLfjH569WLMteNTZ5DxchhmyS4xxx3GPmMURxAbUrHJVU978f8ewY4HbBavTd1Gaodef7Ai7",
		// 	"5Tk5qtxuwEpYPJHB46UXZXfADjNYXHAfDhHiQaU64B8RxbxwdW5vwVvEMUoftkfMhERgkJgLaK6pWUmhZcQ2MTzd",
		// 	"4fKuC1gXPwNowwDXPKo7AtpxoNJcuapJQZxsKGxsAyqZjcC8VuEAztURzgRyTdvU5mnUoSULc9t5A3BShZejbu3p",
		// 	"qnfKxpFmB8o5ii83H9WNn5GknUGawKrgSSXjcUSoLW63idCM2qwqavK2TuijqN4iANeEFDPNGtZxxk8kiVE2xgw",
		// 	"vwsHFiEi7R1uSx6ubnXRzw5KSRkWWT6UBXmG7ZEGGei1WiDVXa67HytXpvvQPeiLzneWUCc9oUy4pqFqdEFdFo5",
		// 	"2oTCeiMQCXtpkEG5DDKyTz1sQYZBQLoCHNDxECwuXS4Nwc9LKytjuNKrx54H96dSL6jcHi2x1fa1n95YqheLit64",
		// ];

		const instructions = await solanaParser.parseTransaction(
			"2oTCeiMQCXtpkEG5DDKyTz1sQYZBQLoCHNDxECwuXS4Nwc9LKytjuNKrx54H96dSL6jcHi2x1fa1n95YqheLit64"
		);

		console.log("instructions", instructions);

		// assert.equal(instruction.type, "JUPITER_SWAP");
		// console.log("instructions", JSON.stringify(instructions, undefined, 2));
	});
}

describe("General", General);
