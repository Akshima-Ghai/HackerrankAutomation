// node hackerrankAutomationModerator.js --url=https://www.hackerrank.com --config=config.json

//npm install minimist
//npm install puppeteer

let minimist = require('minimist');
let puppeteer = require('puppeteer');
let fs = require('fs');
const { start } = require('repl');

let args = minimist(process.argv);
// console.log(args.url);
// console.log(args.config);

let configJSON = fs.readFileSync(args.config, "utf-8");
let configJSO = JSON.parse(configJSON);

// console.log(configJSO.userid);
// console.log(configJSO.password);
// console.log(configJSO.moderator);

async function run() {
    let browser = await puppeteer.launch({
        headless: false,
        args: [
            '--start-maximized'
        ],
        defaultViewport: null
    });

    //get the tabs
    let pages = await browser.pages();
    let page = pages[0];

    //open the url
    await page.goto(args.url);

    //wait and click on login page 1
    await page.waitForSelector("a[data-event-action='Login']");
    await page.click("a[data-event-action='Login']");

    // wait and click on login page 2
    await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
    await page.click("a[href='https://www.hackerrank.com/login']");

    //type userid
    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']", configJSO.userid, { delay: 30 });
    
    //type password
    await page.waitForSelector("input[name='password']");
    await page.type("input[name='password']", configJSO.password, { delay: 30 });

    await page.waitFor(3000);

    //press click on page 3
    await page.waitForSelector("button[data-analytics='LoginPassword']");
    await page.click("button[data-analytics='LoginPassword']");

    //click on compete
    await page.waitForSelector("a[data-analytics='NavBarContests']");
    await page.click("a[data-analytics='NavBarContests']");

    //click on manage contests
    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");


    //find number of pages 
    // await page.waitForSelector("a[data-attr1='Last']");
    // let numPages = await page.$eval("a[data-attr1='Last']", function (atag) {
    //     let totPages = parseInt(atag.getAttribute("data-page"));
    //     return totPages;
    // });
    // console.log(numPages);
    // for (let i = 0; i < numPages ; i++){
        await handleAllContestOfAPage(page, browser);
        // if (i < numPages) {
            await page.waitForSelector("a[data-attr1='Right']");
            await page.click("a[data-attr1='Right']");
        // }
    // }

    
}

async function handleAllContestOfAPage(page,browser) {
    //find all urls of same page
    console.log("hello");
    await page.waitForSelector("a.backbone.block-center");
    let curls = await page.$$eval("a.backbone.block-center", function (atags) {

        let urls = [];
        for (let i = 0; i < atags.length; i++) {
            
            let url = atags[i].getAttribute("href");
            urls.push(url);
        }
        
        return urls;
    });
    

    for (let i = 0; i < curls.length; i++){
        let ctab = await browser.newPage();

        await handleContest(ctab, args.url + curls[i], configJSO.moderator);
        await ctab.close();
        await page.waitFor(3000);
    }
}

async function handleContest(ctab, fullCurl, moderator) {
    await ctab.bringToFront();
    await ctab.goto(fullCurl);
    await ctab.waitFor(3000);

    

    await ctab.waitForSelector("li[data-tab='moderators']");
    await ctab.click("li[data-tab='moderators']");

    await ctab.waitForSelector("input#moderator");
    await ctab.type("input#moderator", moderator, { delay: 30 });
    
    await ctab.keyboard.press("Enter");

}
run();