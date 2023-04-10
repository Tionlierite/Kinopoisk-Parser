const puppeteer = require('puppeteer')
const fs = require("fs");
const {TimeoutError} = require("puppeteer");

async function parse() {
    let ids = []
    fs.readFile('6.txt', function(err, data) {
        if(err) throw err;
        ids = data.toString().split("\r\n");
    });

    let json = {}

    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    for (const id of ids) {
        await page.goto(`https://www.kinopoisk.ru/film/${id}/keywords/`);

        const url = await page.evaluate(() => {
            return location.href
        })

        if (url.startsWith('https://www.kinopoisk.ru/showcaptcha?')) {
            try {
                await page.waitForSelector('.keywordsList', {timeout: 20000})
            } catch (e) {
                if (e instanceof TimeoutError) {
                    continue
                }
            }
        }

        if(await page.evaluate(() => {
            return document.querySelector('.error-page')
        }))
            continue

        json = {
            ...json,
            [id]: {
                "keywords": []
            }
        }

        json[id].keywords = await page.evaluate(() => {
            let keywords = []
            const keywordsList = document.querySelectorAll('.keywordsList')
            keywordsList.forEach(keywordElement => {
                const keyword = keywordElement.querySelectorAll('li')
                keyword.forEach(liElement => {
                    keywords.push(liElement.querySelector('a').getAttribute("data-real-keyword"))
                })
            })

            return keywords
        })
    }

    await browser.close()
    return json
}

parse().then((value) => {
    let jsonString = JSON.stringify(value)

    fs.writeFile("sixth250.json", jsonString, function(err, result) {
        if(err) console.log('error', err);
    });
})