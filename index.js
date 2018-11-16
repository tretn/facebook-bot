const BootBot = require('bootbot');
const config = require('config');
const fetch = require('node-fetch');
const GIPHY_URL = `http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=`;

const bot = new BootBot({
  accessToken: config.get('ACCESS_TOKEN'),
  verifyToken: config.get('VERIFY_TOKEN'),
  appSecret: config.get('APP_SECRET')
});

bot.hear(['hello', 'hi', 'hey'], (payload, chat) => {
  chat.say('Hello there!');
});

bot.hear(/gif (.*)/i, (payload, chat, data) => {
  const query = data.match[1];
  chat.say('Searching for the perfect gif...');
  fetch(GIPHY_URL + query)
    .then(res => res.json())
    .then(json => {
      chat.say({
        attachment: 'image',
        url: json.data.image_url
      }, {
        typing: true
      });
    });
});

bot.start();