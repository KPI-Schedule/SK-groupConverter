const https = require('https');
const en = require('./en');
const ru = require('./ru');

const getGroups = new Promise((resolve, reject) => {
  https.get('https://apischedule.herokuapp.com/api/groups', (res) => {
    const statusCode = res.statusCode;

    let error;
    if (statusCode !== 200) {
      error = new Error(`'Request Failed.\n' Status Code: ${statusCode}`);
    }

    if (error) {
      console.log(error.message);
      res.resume();
      return;
    }

    res.setEncoding('utf8');
    let data = '';
    res.on('data', chunk => (data += chunk));
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
    let enGroup = '';
    let ruGroup = '';
    group.name.split('').map((symbol) => {
      if (isNaN(parseInt(symbol, 10)) && [' ', '-', '(', ')', '/', ','].indexOf(symbol) < 0) {
        if (typeof ru(symbol) === 'undefined') {
          switch (symbol) {
            case 'i': enGroup += 'i'; ruGroup += 'и'; break;
            case 'c': enGroup += 'c'; ruGroup += 'с'; break;
            default: break;
          }
        } else {
          enGroup += en(symbol);
          ruGroup += ru(symbol);
        }
      } else {
        enGroup += symbol;
        ruGroup += symbol;
      }
      return true;
    });
    return {
      id: group.id,
      name: {
        en: enGroup,
        ru: ruGroup,
        ua: group.name,
      },
    };
  });

  const request = https.request({
    hostname: 'apischedule.herokuapp.com',
    method: 'POST',
    path: '/api/groups',
  }, (resp) => {
    resp.on('data', (chunk) => {
      console.log(chunk.toString('utf8'));
    });
    resp.on('error', (e) => {
      console.log(new Error(`Request Failed.\n Got error: ${e.message}`));
    });
  });

  request.write(JSON.stringify(groups));
  request.end();
});

getGroups.catch(() => {
  console.log('Promise rejected');
});