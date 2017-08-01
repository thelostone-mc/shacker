const phantom = require('phantom'),
      cheerio = require('cheerio'),
      sleep = require('sleep');
      config = require('../../config');

const headlessCrawl = (trackingId, url) => {
  return new Promise(async (resolve, reject) => {

    if(!trackingId || trackingId == 0) {
      console.log("trackingId: Invalid");
      return reject("trackingId: Invalid");
    }

    try {
      const instance = await phantom.create();
      url = url + trackingId;

      const page = await instance.createPage();
      const status = await page.open(url);

      setTimeout(async () => {
        const content = await page.property('content');
        await instance.exit();
        const $ = cheerio.load(content);
        if($('#jsTrkAlert').text() || !$('.jsResultBlock').text()) {
          console.log("Alertbox", url, ($('#jsTrkAlert').text()));
          sleep.sleep(config.SERVER_REJECT_SLEEP);
          reject();
        }
        resolve(content);
      }, config.PHANTOM_TIMEOUT);
    } catch (error) {
      console.log("phantomjs: refusal", error, url);
      sleep.sleep(config.SERVER_REJECT_SLEEP);
      reject();
    }
  });
};

module.exports =  {
  headlessCrawl
}
