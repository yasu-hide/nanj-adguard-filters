'use strict';
require('dotenv').config()
const express = require("express")
const request = require("request")
const log4js = require("log4js")
const fs = require("fs")
const tmp = require("tmp")
const path = require("path")
const helmet = require("helmet")
const {
  JSDOM
} = require("jsdom")

log4js.configure({
    appenders: {
	access: { type: 'console' }
    },
    categories: {
	default: { appenders: [ 'access' ], level: 'info' }
    }
})
const app = express()
app.use(helmet())
app.use(log4js.connectLogger(log4js.getLogger()))

function getNanjWiki(nanjWikiUrl, savePath, filterTitle) {
    return new Promise((resolve, reject) => {
        request(nanjWikiUrl, (e, r, body) => {
                if(e) {
                    return reject(e)
                }
                if(r.statusCode !== 200) {
                    return reject(`unexpected response ${r.statusText}`)
                }
                const dom = new JSDOM(body)
                for(const data of dom.window.document.querySelectorAll("div#content > blockquote > p.quotation")) {
                    const filterBody = data.textContent
                    if(filterBody.indexOf('!') === -1) {
                        continue
                    }
                    if(filterBody.indexOf(filterTitle) === -1) {
                        continue
                    }
                    const savePathTmp = path.resolve(path.dirname(savePath), path.basename(tmp.tmpNameSync()))
                    fs.writeFileSync(savePathTmp, filterBody)
                    fs.rename(savePathTmp, savePath, e => { return reject(e) })
                    return resolve(filterBody)
                }
        })
    }).catch(e => {
        console.error(e)
        return Promise.resolve(fs.readFileSync(savePath))
    }).catch (e => {
        console.error(e)
    })
}

const filtersNanjWiki = {
    'nanj-kaishuu-filter.txt': {
        url: 'https://wikiwiki.jp/nanj-adguard/%E3%81%AA%E3%82%93J%E6%94%B9%E4%BF%AE%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF%E3%83%BC',
        title: '! Title: なんJ改修フィルター'
    },
    'nanj-kaishuu-dns-filter.txt': {
        url: 'https://wikiwiki.jp/nanj-adguard/%E3%81%AA%E3%82%93J%E6%94%B9%E4%BF%AE%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF%E3%83%BC',
        title: '! Title: なんJ改修DNSフィルター'
    },
    'supplement-rules.txt': {
        url: 'https://wikiwiki.jp/nanj-adguard/%E3%81%AA%E3%82%93J%E6%8B%A1%E5%BC%B5%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF%E3%83%BC',
        title: '! Title: なんJ拡張フィルター：一般ルール'
    },
    'DNS-rules.txt': {
        url: 'https://wikiwiki.jp/nanj-adguard/%E3%81%AA%E3%82%93J%E6%8B%A1%E5%BC%B5%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF%E3%83%BC',
        title: '! Title: なんJ拡張フィルター：DNSルール'
    },
    'paranoid-rules.txt': {
        url: 'https://wikiwiki.jp/nanj-adguard/%E3%81%AA%E3%82%93J%E6%8B%A1%E5%BC%B5%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF%E3%83%BC',
        title: '! Title: なんJ拡張フィルター：Paranoidルール'
    }
}

for(const [ k, v ] of Object.entries(filtersNanjWiki)) {
    const routePath = "/" + k
    const savePath = path.resolve("CACHE_" + k)
    app.get(routePath, (req, res) => {
        getNanjWiki(v['url'], savePath, v['title']).then((filterBody) => {
            res.send(filterBody)
        }).catch(() => {
            res.status(400)
        })
    });
}

const now = new Date(), y = now.getFullYear(), m = ('0' + (now.getMonth() + 1)).slice(-2)
app.get("/280blocker_adblock.txt", (request, response) => {
    response.redirect(`https://280blocker.net/files/280blocker_adblock_${y}${m}.txt`)
});

const listener = app.listen(process.env.PORT, () => {
    console.log("Your app is listening on port " + listener.address().port)
});
