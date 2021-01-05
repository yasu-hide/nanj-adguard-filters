'use strict';
const express = require("express")
const request = require("request")
const {
  JSDOM
} = require("jsdom")
const app = express()

function encode(str){
    str = encodeURIComponent(str).split('%').join('');
    return str;
}

function requestNanjWiki(url, filter_title) {
    return new Promise((resolve, reject) => {
        request(url, (e, r, body) => {
            if(e) {
                reject(e)
            }
            try {
                const dom = new JSDOM(body)
                for(const data of dom.window.document.querySelectorAll("div#content > blockquote > p.quotation")) {
                    const filter_data = data.textContent
                    if(filter_data.indexOf('!') === -1) {
                        continue
                    }
                    if(filter_data.indexOf(filter_title) === -1) {
                        continue
                    }
                    resolve(filter_data)
                }
            } catch (e) {
                reject(e)
            }
        })
    })
}

app.get("/nanj-kaishuu-filter.txt", (req, res) => {
    requestNanjWiki('https://wikiwiki.jp/nanj-adguard/%E3%81%AA%E3%82%93J%E6%94%B9%E4%BF%AE%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF%E3%83%BC', '! Title: なんJ改修フィルター').then((filter_data) => {
        res.send(filter_data)
    }).catch(() => {
        res.status(400)
    })
});
app.get("/nanj-kaishuu-dns-filter.txt", (req, res) => {
    requestNanjWiki('https://wikiwiki.jp/nanj-adguard/%E3%81%AA%E3%82%93J%E6%94%B9%E4%BF%AE%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF%E3%83%BC', '! Title: なんJ改修DNSフィルター').then((filter_data) => {
        res.send(filter_data)
    }).catch(() => {
        res.status(400)
    })
});
app.get("/supplement-rules.txt", (req, res) => {
    requestNanjWiki('https://wikiwiki.jp/nanj-adguard/%E3%81%AA%E3%82%93J%E6%8B%A1%E5%BC%B5%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF%E3%83%BC', '! Title: なんJ拡張フィルター：一般ルール').then((filter_data) => {
        res.send(filter_data)
    }).catch(() => {
        res.status(400)
    })
});
app.get("/DNS-rules.txt", (req, res) => {
    requestNanjWiki('https://wikiwiki.jp/nanj-adguard/%E3%81%AA%E3%82%93J%E6%8B%A1%E5%BC%B5%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF%E3%83%BC', '! Title: なんJ拡張フィルター：DNSルール').then((filter_data) => {
        res.send(filter_data)
    }).catch(() => {
        res.status(400)
    })
});
app.get("/paranoid-rules.txt", (req, res) => {
    requestNanjWiki('https://wikiwiki.jp/nanj-adguard/%E3%81%AA%E3%82%93J%E6%8B%A1%E5%BC%B5%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF%E3%83%BC', '! Title: なんJ拡張フィルター：Paranoidルール').then((filter_data) => {
        res.send(filter_data)
    }).catch(() => {
        res.status(400)
    })
});
const now = new Date(), y = now.getFullYear(), m = ('0' + (now.getMonth() + 1)).slice(-2)
app.get("/280blocker_adblock.txt", (request, response) => {
    response.redirect(`https://280blocker.net/files/280blocker_adblock_${y}${m}.txt`)
});

const port = 3000 || process.env.PORT
const listener = app.listen(port, () => {
    console.log("Your app is listening on port " + listener.address().port)
});