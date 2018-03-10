const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const Cosmic = require('cosmicjs')
const BootBot = require('bootbot')
require('dotenv').config()
const chrono = require('chrono-node')
var schedule = require('node-schedule')
const EventEmitter = require('events').EventEmitter
var weather = require('weather-js')

var config = {}

const odpovedJeAno = (odpoved) => {
  var anoOdpovedi = ['ano', 'jo', 'tak jo', 'jasně']
  return anoOdpovedi.includes(odpoved.toLowerCase)
}

const odpovedJeNe = (odpoved) => {
  var neOdpovedi = ['ne', 'ani omylem', 'nechci']
  return neOdpovedi.includes(odpoved.toLowerCase)
}

const reminders = []

const eventEmitter = new EventEmitter()

app.set('port', (3000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/', function(req, res) {
  res.send("Ahoj, jsem Náladobot. Můžeš si se mnou psát na facebooku!")
})

app.get('/webhook/', function(req, res) {
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN){
    return res.send(req.query['hub.challenge'])
  }
  res.send('wrong token')
})

app.listen(app.get('port'), function(){
  console.log('Started on port', app.get('port'))
})

const bot = new BootBot({
  accessToken: process.env.ACCESS_TOKEN,
  verifyToken: process.env.VERIFY_TOKEN,
  appSecret: process.env.APP_SECRET
})

bot.setGreetingText("Tento chatbot Vám řekne, jaké bude počasí")

bot.setGetStartedButton((payload, chat) => {
  chat.say({text: 'Ahoj! Zeptej se mě, jaké bude počasí',
            quickReplies: ['Počasí dnes', 'Počasí zítra']}, {typing: 2000});
});

const pocasiDnesKonverzace = (conversation) => {
  weather.find({search: 'Prague, Czech Republic', degreeType: 'C'}, function(err, result) {
    var currentTemperature = result[0].current.temperature
    conversation.ask({text: 'Dneska bude '+currentTemperature+'°C. Chceš vědět i jak bude zítra?',
      quickReplies: ['Ano', 'Ne']}, (payload, chat) => {
        var odpoved = payload.message.text;
        if (odpoved == 'Ano' || odpoved == 'jo') {
          chat.conversation(pocasiZitraKonverzace)
          chat.end()
        } else {
          chat.say('Tak ahoj!')
          chat.end()
        }
    }, [], {typing: 2000});
  })
}

const pocasiZitraKonverzace = (conversation) => {
  weather.find({search: 'Prague, Czech Republic', degreeType: 'C'}, function(err, result) {
    var tomorrow = result[0].forecast[2]
    conversation.ask({text: 'Zítra bude '+tomorrow.low+'-'+tomorrow.high+'°C. Chceš vědět i jak bude dnes?',
      quickReplies: ['Ano', 'Ne']}, (payload, chat) => {
        var odpoved = payload.message.text;
        if (odpoved == 'Ano' || odpoved == 'jo') {
          chat.conversation(pocasiDnesKonverzace)
          chat.end()
        } else {
          chat.say('Tak ahoj!')
          chat.end()
        }
      }, [], {typing: 2000});
  })
}

bot.hear(['Počasí dnes', 'dnes', 'dneska'], (payload, chat) => {
  chat.conversation(pocasiDnesKonverzace)
})

bot.hear(['Počasí zítra', 'zítra', 'zejtra'], (payload, chat) => {
  chat.conversation(pocasiZitraKonverzace)
})



/*
bot.hear(['ahoj', 'čau', 'čus'], (payload, chat) => {
  chat.say({'text': 'Tobě taky ahoj!',
            'quickReplies': ['Řekni mi vtip', 'Co mám dělat?']});
});

bot.hear('vtip', (payload, chat) => {
  const jakyVtipChces = (convo) => {
    convo.ask("Chceš slyšet první nebo druhý vtip?", (payload, convo) => {
      var kteryVtip = payload.message.text;
      chat.say("Chceš slyšet "+kteryVtip+" vtip");
    })
  }
  
  chat.conversation((convo) => {
    jakyVtipChces(convo)
  })
})
*/

bot.start(process.env.PORT || 5000)

weather.find({search: 'Prague, Czech Republic', degreeType: 'C'}, function(err, result) {
  if(err) console.log(err);
  
  console.log(result[0].current.temperature);
  var tomorrow = result[0].forecast[2]
  console.log(tomorrow.low + " - " + tomorrow.high);
  var image = result[0].current.imageUrl
});