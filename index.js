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

var config = {}

const reminders = []

const eventEmitter = new EventEmitter()

app.set('port', (process.env.PORT || 5000))
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

bot.setGreetingText("Ahoj, jak se dneska máš? Nezvedl by ti náladu vtip?")

bot.setGetStartedButton((payload, chat) => {
  if(config.bucket === undefined){
    chat.say('Ahoj! Jsem Náladobot a mým účelem je zvednout ti náladu!')
  }
  BotUserId = payload.sender.id
});

bot.hear(['ahoj', 'čau', 'čus'], (payload, chat)=>{
  chat.getUserProfile().then((user) => {
    chat.say(`Ahoj ${user.first_name}, jak se dnes máš?`)
  })
})

bot.hear(['vtip'], (payload, chat)=>{
  chat.say('Co řekne arabský včelař, když mu uletí včely? Ach med.')
})

bot.hear('pomoc', (payload, chat) => {
  chat.say('Žádné starosti, tady je pár příkazů, které poslouchám:')
  chat.say("'vtip': řeknu ti vtip")
  chat.say("'ahoj': pozdravím tě zpátky")
  chat.say("'pomoc': řeknu ti, s jakými příkazy umím pracovat")
})

bot.start()
