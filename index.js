const BootBot = require('bootbot');
const config = require('config');
const fetch = require('node-fetch');

const MOVIE_API = "http://www.omdbapi.com/?apikey=8df4f6a8"

var port = process.env.PORT || config.get('PORT');

const bot = new BootBot({
  accessToken: config.get('ACCESS_TOKEN'),
  verifyToken: config.get('VERIFY_TOKEN'),
  appSecret: config.get('APP_SECRET')
});

bot.hear(['hi', 'hello'], (payload, chat) => {
  chat.say('Hi! If you would like to know details about a movie, tell me "movie" and the name of the movie', {typing: true})
});


bot.hear(/movie (.*)/i, (payload, chat, data) => {
  chat.conversation((conversation) => {
    const movieName = data.match[1];
    console.log("Somebody asked about movie "+movieName);
    fetch(MOVIE_API+'&t='+movieName)
      .then(res => res.json())
      .then(json => {
        console.log("Search result is "+JSON.stringify(json));
        if (json.Response === "False") {
          conversation.say('I could not find the movie '+movieName+', you can try searching for movie like "search [movie name]"', {typing: true});
          conversation.end();
        } else {
          conversation.say('I found a movie '+json.Title, {typing: true});
          setTimeout(() => {
            conversation.say("The movie is from "+json.Year+" and was directed by "+json.Director, {typing: true});
          }, 1000)
          handlePlot(conversation, json);
        }
    });
  })
})

function handlePlot(conversation, json) {
  setTimeout(() => {
    conversation.ask({
      text: "Would you like to know what the movie is about?",
      quickReplies: ["Yes", "No"],
      options: {typing: true}
    }, (payload, conversation) => {
      if (payload.message.text === "Yes") {
        conversation.say(json.Plot, {typing: true});
        conversation.end();
      } else {
        conversation.say("Ok, ask me about a different movie then.", {typing: true});
        conversation.end();
      }
    });
  }, 2000)
}

bot.start(port);