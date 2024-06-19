const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();
const port =443;

app.get('/rss-to-json', async (req, res) => {
    try {
        // 替换为你的 VitePress RSS 订阅源 URL
        const rssUrl = 'https://re.scue.us/feed.xml';
        
        const response = await axios.get(rssUrl);
        const xmlData = response.data;

        const parser = new xml2js.Parser();
        parser.parseString(xmlData, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to parse XML' });
            }

            res.json(result);
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch RSS feed' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at https://upstairslog.vercel.app`);
});
