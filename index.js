const https = require('https');
const en = require('./en');
const ru = require('./ru');

const getGroups = new Promise((resolve, reject) => {
  https.get('https://apischedule.herokuapp.com/api/groups', (res) => { 
    const statusCode = res.statusCode;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      error = new Error(`Request Failed.\n` +
                        `Status Code: ${statusCode}`);
    }

    if (error) {
      console.log(error.message);
      res.resume();
      return;
    }

    res.setEncoding('utf8');
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(e.message);
      }
    });
  }).on('error', (e) => {
    console.log(`Got error: ${e.message}`);
  });
});

getGroups.then((response) => {
  const groups = response.map((group) => {
    let enName = '', ruName = '', uaName = '';
    group.name.split('').map((symbol) => {
      uaName += symbol;
      if (isNaN(parseInt(symbol)) && [' ', '-', '(', ')', '/', ','].indexOf(symbol) < 0) {
        if (typeof ru(symbol) === 'undefined') {
          if (symbol === 'i') {
            enName += 'i';
            ruName += 'и';
          } else if (symbol === 'c') {
            enName += 'c';
            ruName += 'с';
          }
        } else {
          enName += en(symbol);
          ruName += ru(symbol);
        }
      } else {
        enName += symbol;
        ruName += symbol;
      }
    });
    return {
      id: group.id,
      name: {
        enName: enName,
        ruName: ruName,
        uaName: uaName
      }
    }
  });
  console.log(groups);
});

getGroups.catch(function () {
  console.log("Promise Rejected");
});
