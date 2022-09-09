require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

// Enable body parsing
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


const longToShort = new Map();
const shortToLong = new Map();
const choices = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const generateShortUrl = function() {
    let shortUrl = '';
    while (shortUrl.length < 1 || shortToLong.has(shortUrl)) {
        shortUrl += choices[Math.floor(Math.random() * choices.length)];
    }
    return shortUrl;
}

/** Make short URLs out of original URLs */
app.post('/api/shorturl', function(req, res) {
  let longUrl = req.body.url;

  // verify url by dns
  if (!longUrl.match(/^https?:\/\//)) {
    return res.json({ error: 'invalid url' });
  }

  let shortUrl = null;
  if (longToShort.has(longUrl)) {
    shortUrl = longToShort.get(longUrl);
  } else {
    shortUrl = generateShortUrl();
    longToShort.set(longUrl, shortUrl);
    shortToLong.set(shortUrl, longUrl);
  }

  res.json({ original_url: longUrl, short_url: shortUrl });
});

/** Redirect short URLs to original URLs */
app.get('/api/shorturl/:shortUrl', function(req, res) {
  let shortUrl = req.params.shortUrl;
  if (shortToLong.has(shortUrl)) {
    res.redirect(shortToLong.get(shortUrl));
  } else {
    res.json({ error: 'invalid url' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
