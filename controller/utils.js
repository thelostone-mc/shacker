const getKeyProperties = (array, property) => {
  let list = [];
  array.forEach((object) => {
    if(!object[property]) {
      console.log("getKeyProperties: Unable to find", property, "in", object);
    }
    else {
      list.push(object[property]);
    }
  })
  return list;
};

const matchString = (string, matcher) => {
  return string.includes(matcher);
};

module.exports =  {
  getKeyProperties,
  matchString
}
