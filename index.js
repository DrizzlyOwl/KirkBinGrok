var colors = require('colors/safe');

const puppeteer = require('puppeteer');
const kirkBaseURL = "https://www.kirklees.gov.uk/beta/your-property-bins-recycling/your-bins/";
const kirkDefaultURL = "default.aspx";
const kirkCalURL = "calendar.aspx";

// Property search form UI elems
const searchNumberEl = "#cphPageBody_cphContent_thisGeoSearch_txtGeoPremises";
const searchPostcodeEl = "#cphPageBody_cphContent_thisGeoSearch_txtGeoSearch";
const searchSubmitEl = "#butGeoSearch";

// User prompt info
const prompt = require('prompt');
const properties = [
    {
        name: 'housenumber',
        description: "Your house name or number",
        required: true
    },
    {
        name: 'postcode',
        description: "Your post code",
        required: true
    }
];

console.log("====== KirkBinGrok ======");
prompt.start();

prompt.get(properties, function (err, result) {
    if (err) { return onErr(err); }

    (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(kirkBaseURL + kirkDefaultURL);
        await page.type(searchNumberEl, result.housenumber);
        await page.type(searchPostcodeEl, result.postcode);
        await page.click(searchSubmitEl);
        await Promise.all([
            page.waitForNavigation({
                options: {
                    timeout: 10
                },
                waitUntil: 'domcontentloaded'
            })
        ]);

        const calendarLink = await page.$eval("#cphPageBody_cphContent_wtcDomestic240_LnkCalendarFS", el => el.href);

        // Get the unique property number
        const uprn = await page.$eval("#txtSubscribeUprn", el => el.value);
        await page.goto(kirkBaseURL + kirkCalURL + "?UPRN=" + uprn);

        // Get the found address
        const address = await page.$eval('#cphPageBody_cphContent_lblChosenAddress', el => el.innerText);
        console.log(colors.green.bold("\nAddress matched!\n"), "📫 " + address, "\n");

        // Get the dates
        let dates = await page.$$eval('.page-content > section span', el => el.map((value) => {
            return value.innerText
        }));

        // Get the bin type
        const bintypes = await page.$$eval('.page-content > section img', el => el.map((value) => {
            return value.src.includes('green') ? 'green' : 'grey';
        }));

        // Free up memory
        await browser.close();

        // Output final result
        let dataset = [];
        for (let index = 0; index < dates.length; index++) {
            const bintype = bintypes[index];
            const str = bintype == 'green' ? colors.green(bintype) : colors.grey(bintype);
            console.log(colors.bold(dates[index].padEnd(10)), str);
        }
        // Output to screen
        console.log("\nDownload a PDF print-out here:");
        console.log(colors.underline(calendarLink));
        console.log("\nDone!");
    })();
});

function onErr(err) {
    console.log(colors.red.underline(err));
    return 1;
}
