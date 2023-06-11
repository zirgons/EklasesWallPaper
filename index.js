const config = require('./config');
const { URLSearchParams } = require('url');
const puppeteer = require("puppeteer");
const images = require("images");	
const wallpaper = require('wallpaper');
//const response = await page.goto(config.eklase.login_url+'?'+params.toString(), {waitUntil: 'load', timeout: 0});

async function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



async function main() {
    console.log('Launching browser');
    const browser = await puppeteer.launch({
        args: ["--enable-features=NetworkService", "--no-sandbox"],
        headless: true,
        ignoreHTTPSErrors: true
    });

    console.log('Opening a new page');
    const page = await browser.newPage();

    let device = {
        name: 'custom device',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
        viewport: {
            width: 760,
            height: 1400,
            deviceScaleFactor: 1.5,
            isMobile: false,
            hasTouch: false,
            isLandscape: false
        }
    }
    console.log('Setting viewport, scale factor');
    await page.emulate(device);

    console.log('Setting request interception');
    await page.setRequestInterception(true);
    page.once('request', interceptedRequest => {
        interceptedRequest.continue({'method': 'POST'});
        page.setRequestInterception(false);
    });

    console.log('Logging in');
    const params = new URLSearchParams();
    params.append('v', '15');
    params.append('UserName', config.eklase.user_name);
    params.append('Password', config.eklase.password);
    const response = await page.goto(config.eklase.login_url+'?'+params.toString());
    
    await timeout(2000);

    await Promise.race([
        page.waitForSelector(".diary-container .row"),
        page.waitForSelector(".diary-container h2"),
        page.waitForSelector(".dashboard-news")
    ]);

    console.log('Removing useless stuff');
    await page.evaluate(() => {
       
        const style = `
header,
footer,
.diary-container .row,
.diary-container h2,
.footer,
.dashboard-news,
.widget-recent,
.widget-notifications,
.dashboard-upper-widgets { display: none !important }

body, html { background: white !important }

.actual-lessons-item {
  margin-top: 16px !important;
}


* {
  color: black !important;
  backgroundcolor: white !important;
  box-shadow: none !important;
  padding: 0 !important;
  font-size: 18px !important;
  line-height: 120% !important;
  height: auto !important;
}
.lesson-title {
  line-height: 120% !important;
  background: transparent !important;
  font-size: 32px !important;
  position: absolute !important;
  width: 180px !important;
}
.lesson-subitem {
  margin-left: 160px !important;
  width: 570px !important;
}

.lesson-subitem .title { display: none !important }


        `
        const s = document.createElement('style')
        s.type = 'text/css'
        s.appendChild(document.createTextNode(style));
        document.head.appendChild(s)
    });

    console.log('Taking e-klase screenshot');
    await page.screenshot({path: 'screenshot.png'})

    console.log('Rendering time.png')
    const timePage = await browser.newPage();
    await timePage.setViewport({
        width: 300,
        height: 50,
        padding: 30,
        deviceScaleFactor: 1,
    });
    let time = new Date().toLocaleString();
    let html = '<p style="font-weight: bold; font-size: 170%;">'+time+'</p>';
    await timePage.setContent(html);
    await timePage.screenshot({path: 'time.png'});
    
    console.log('Closing the browser');
    await browser.close();

    console.log('Merging screenshot with time');
    let timeX = (images("screenshot.png").width()-images("time.png").width())/2;
    images("screenshot.png").draw(images("time.png"), timeX, 20).save("screenshot.png");

    console.log('Drawing wallpaper');
    let padding = 45;
    let x = images("wallpaper.png").width()-images("screenshot.png").width()-padding;
    let y = padding;
    images("wallpaper.png").draw(images("screenshot.png"), x, y).save("output.png");

    console.log('Setting wallpaper');
    await wallpaper.set('output.png');

    console.log('Done');
}

main();
setInterval(main, 60*20*1000);
