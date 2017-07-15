const phantom = require('phantom'),
      cheerio = require('cheerio');

const TIMEOUT = 120000;
const headlessCrawl = (trackingId, url) => {
  return new Promise(async (resolve, reject) => {

    if(!trackingId || trackingId == 0) {
      console.log("trackingId: Invalid");
      return reject("trackingId: Invalid");
    }

    const instance = await phantom.create();
    url = url + trackingId;

    const page = await instance.createPage();
    const status = await page.open(url);

    setTimeout(async () => {
      const content = await page.property('content');
      await instance.exit();
      const $ = cheerio.load(content);
      if(!$('.newest').text()) {
        reject();
      }
      resolve(content);
    }, TIMEOUT);
  });
};

module.exports =  {
  headlessCrawl
}
