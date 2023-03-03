let fs = require('fs');
const puppeteer = require('puppeteer')

fs.readFile('1.txt', function(err, data) {
    if(err) throw err;
    let IdsArray = data.toString().split("\r\n");
    console.log(IdsArray);

    let jsonString = JSON.stringify(IdsArray)

    fs.writeFile("some.json", jsonString, function(err, result) {
        if(err) console.log('error', err);
    });
});

