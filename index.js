const crawler = require('./controller/crawler.js');
      purifier = require('./controller/purifier.js');

const list = ["LW377059748CN,LK272056367CN"];

crawler.headlessCrawl("LW431678671CN").then((content) => {
  console.log(purifier.extractDataUnit(content));
});

crawler.headlessCrawl(list).then((content) => {
  console.log(purifier.extractDataSet(content));
});
