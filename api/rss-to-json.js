const axios = require('axios');
const xml2js = require('xml2js');

module.exports = async (req, res) => {
    try {
        const rssUrl = 'https://re.scue.us/feed.xml';  // 使用你的 RSS URL

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
};
