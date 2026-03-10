const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').forEach((line: string) => {
    if (!line || line.startsWith('#')) return;
    const [k, v] = line.split('=');
    if (k && v) process.env[k.trim()] = v.trim().replace(/^['"]|['"]$/g, '');
});

import { getGoogleSheetsClient } from "./lib/googleSheets";

async function run() {
    try {
        const sheets = await getGoogleSheetsClient();
        const dbData = await sheets.spreadsheets.values.get({
            spreadsheetId: "1aHust80ArTzLxr_n1s9XSFdTvNopCYRmvoU75MJmsHA",
            range: "Asegurados!A1:BZ",
        });
        console.log(JSON.stringify(dbData.data.values?.slice(0, 3), null, 2));
    } catch (e) {
        console.error(e);
    }
}

run();
