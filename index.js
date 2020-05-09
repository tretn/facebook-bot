const BootBot = require('bootbot');
const config = require('config');
const fetch = require('node-fetch');

const currentTemperature_API = "http://api.openweathermap.org/data/2.5/weather?q="
const forecast5dayTemperature_API = "http://api.openweathermap.org/data/2.5/forecast?q="
const ApiKey = "&APPID=992a229e446e32a6d140673735fa3e7b&units=metric"

var port = process.env.PORT || config.get('PORT');

const bot = new BootBot({
  accessToken: config.get('ACCESS_TOKEN'),
  verifyToken: config.get('VERIFY_TOKEN'),
  appSecret: config.get('APP_SECRET')
});

bot.setGreetingText("Hi, I'm here to help you find out the current and future weather.")

bot.setGetStartedButton((payload, chat) => {
  chat.say("Hi, I'm here to help you find out the current and future weather.\n");
  chat.say("Choose help in the menu or just write help to find out what I can do.", { typing: true });
});

const aboutMenu = (payload, chat) => {
  chat.say("Chatbot is used to find out weather information in user-specified cities.")
  chat.say("This chatbot was created while studying at Unicorn college as a school project and is based on the BootBot.js library and uses public free api from openweathermap.org/", { typing: true })
};
bot.hear([`about`, `about chatbot`], aboutMenu);

const helpMenu = (payload, chat) => {
  chat.say("You can ask me the following things: \n" +
    "\"weather city\", for current weather.\n" +
    "\"forecast city\", for 5 day forecast.\n" +
    "\"temp or temperature city\", for current temperature.\n" +
    "\"sunset city\", for current sunset.\n" +
    "\"sunrise city\", for current sunrise.\n" +
    "\"city\" is the city for which you want to find out the weather.\n" +
    "You can find more detailed help for individual commands just by writing them."
    , { typing: true });
};
bot.hear(['help', 'help me'], helpMenu);

const weatherCommandMenu = (payload, chat) => {
  chat.say("The command is used to fin the current weather. The form of the command is \"weather city\" and after successfully searching for the city you can choose what you want to display. You can choose from: Temperature, Current weather, Feels like temp, Minimum temp, Maximum temp, Pressure, Humidity, Wind speed, Sunrise, Sunset or you can choose to display all information using the \"all\" option. Example: \"weather prague\"")
};
bot.hear([`weather`], weatherCommandMenu);

const forecastCommandMenu = (payload, chat) => {
  chat.say("The command is used to determine the forecast weather. The form of the command is \"forecast city\" and after successfully searching for the city you can choose what you want to display. You can choose from: Temperature and General weather. Example: \"forecast brno\"")
};
bot.hear([`forecast`], forecastCommandMenu);

const tempCommandMenu = (payload, chat) => {
  chat.say("The command is used to determine the current temperature. The form of the command is \"temp or temperature city \" and after successfully searching the command displays the temperature, feels like temperature, minimum and maximum temperature. Example: \"temp Seč\"")
};
bot.hear([`temp`, `temperature`], tempCommandMenu);

const sunriseCommandMenu = (payload, chat) => {
  chat.say("The command is used to determine the current sunrise time. The form of the command is \"sunrise city \" and after successfully searching the command displays the sunrise time. Example: \"sunrise Boston\"")
};
bot.hear([`sunrise`], sunriseCommandMenu);

const sunsetCommandMenu = (payload, chat) => {
  chat.say("The command is used to determine the current sunset time. The form of the command is \"sunset city \" and after successfully searching the command displays the sunset time. Example: \"sunset Osaka\"")
};
bot.hear([`sunset`], sunsetCommandMenu);

bot.setPersistentMenu([
  { type: 'postback', title: 'About', payload: 'MENU_ABOUT' },
  { type: 'postback', title: 'Help', payload: 'MENU_HELP' }
]);

bot.on('postback:MENU_ABOUT', aboutMenu);
bot.on('postback:MENU_HELP', helpMenu);

bot.hear(/forecast (.*)/i, (payload, chat, data) => {
  chat.conversation((conversation) => {
    const city = data.match[1];
    console.log("Someone asked about the weather forecast in " + city);
    fetch(forecast5dayTemperature_API + city + ApiKey)
      .then(res => res.json())
      .then(json => {
        console.log("Search result is " + JSON.stringify(json));
        if (json.cod === "404") {
          conversation.say('I could not find the city ' + city + '.', { typing: true });
          conversation.end();
        } else {
          conversation.say('I found a city ' + json.city.name + " in " + json.city.country, { typing: true });
          weather5dayForecast(conversation, json);
        }
      });
  })
})

bot.hear(/weather (.*)/i, (payload, chat, data) => {
  chat.conversation((conversation) => {
    const city = data.match[1];
    console.log("Someone asked about temperature in " + city);
    fetch(currentTemperature_API + city + ApiKey)
      .then(res => res.json())
      .then(json => {
        console.log("Search result is " + JSON.stringify(json));
        if (json.cod === "404") {
          conversation.say('I could not find the city ' + city + '.', { typing: true });
          conversation.end();
        } else {
          conversation.say('I found a city ' + json.name + " in " + json.sys.country, { typing: true });
          currentWeather(conversation, json);
        }
      });
  })
})

bot.hear(/temp\w{0,7} (.*)/i, (payload, chat, data) => {
  chat.conversation((conversation) => {
    const city = data.match[1];
    console.log("Someone asked about the weather in " + city);
    fetch(currentTemperature_API + city + ApiKey)
      .then(res => res.json())
      .then(json => {
        console.log("Search result is " + JSON.stringify(json));
        if (json.cod === "404") {
          conversation.say('I could not find the city ' + city + '.', { typing: true });
          conversation.end();
        } else {
          conversation.say('I found a city ' + json.name + " in " + json.sys.country, { typing: true });
          currentTemperature(conversation, json);
        }
      });
  })
})

bot.hear(/sunset (.*)/i, (payload, chat, data) => {
  chat.conversation((conversation) => {
    const city = data.match[1];
    console.log("Someone asked about the weather in " + city);
    fetch(currentTemperature_API + city + ApiKey)
      .then(res => res.json())
      .then(json => {
        console.log("Search result is " + JSON.stringify(json));
        if (json.cod === "404") {
          conversation.say('I could not find the city ' + city + '.', { typing: true });
          conversation.end();
        } else {
          conversation.say('I found a city ' + json.name + " in " + json.sys.country, { typing: true });
          currentSunset(conversation, json);
        }
      });
  })
})

bot.hear(/sunrise (.*)/i, (payload, chat, data) => {
  chat.conversation((conversation) => {
    const city = data.match[1];
    console.log("Someone asked about the weather in " + city);
    fetch(currentTemperature_API + city + ApiKey)
      .then(res => res.json())
      .then(json => {
        console.log("Search result is " + JSON.stringify(json));
        if (json.cod === "404") {
          conversation.say('I could not find the city ' + city + '.', { typing: true });
          conversation.end();
        } else {
          conversation.say('I found a city ' + json.name + " in " + json.sys.country, { typing: true });
          currentSunrise(conversation, json);
        }
      });
  })
})

function currentWeather(conversation, json) {
  setTimeout(() => {
    conversation.ask({
      text: "What information about the current weather do you want?",
      quickReplies: ["Temperature", "All", "Current weather","Pressure", "Humidity", "Wind speed", "Sunrise", "Sunset", "Feels like temp", "Minimum temp", "Maximum temp"],
      options: { typing: true }
    }, (payload, conversation) => {
      switch (payload.message.text) {
        case "Current weather":
          conversation.say("Current weather in " + json.name + " (" + json.sys.country + ") is " + json.weather[0].main + ".", { typing: true });
          conversation.end();
          break;
        case "Temperature":
          conversation.say("Current temperature in " + json.name + " (" + json.sys.country + ") is " + json.main.temp + " Celsius.", { typing: true });
          conversation.end();
          break;
        case "Feels like temp":
          conversation.say("Current feels like temperature in " + json.name + " (" + json.sys.country + ") is " + json.main.feels_like + " Celsius.", { typing: true });
          conversation.end();
          break;
        case "Minimum temp":
          conversation.say("Current minimum temperature in " + json.name + " (" + json.sys.country + ") is " + json.main.temp_min + " Celsius.", { typing: true });
          conversation.end();
          break;
        case "Maximum temp":
          conversation.say("Current maximum temperature in " + json.name + " (" + json.sys.country + ") is " + json.main.temp_max + " Celsius.", { typing: true });
          conversation.end();
          break;
        case "All":
          conversation.say(
            "In " + json.name + " (" + json.sys.country + ") " +
            "Current weather: " + json.weather[0].main + ".\n" +
            "Temperature is " + json.main.temp + " Celsius.\n" +
            "Feels like temperature is " + json.main.feels_like + " Celsius.\n" +
            "Minimum temp is " + json.main.temp_min + " Celsius.\n" +
            "Maximum temp is " + json.main.temp_max + " Celsius.\n" +
            "Pressure is " + json.main.pressure + " hPa.\n" +
            "Humidity is " + json.main.humidity + " %.\n" +
            "Sunrise is " + getTimeFromUnix(json.sys.sunrise) + ".\n" +
            "Sunset is " + getTimeFromUnix(json.sys.sunset) + ".\n" +
            "Wind speed is " + json.wind.speed + " meter/sec.", { typing: true });
          conversation.end();
          break;
        case "Pressure":
          conversation.say("Current pressure in " + json.name + " (" + json.sys.country + ") is " + json.main.pressure + " hPa.", { typing: true });
          conversation.end();
          break;
        case "Humidity":
          conversation.say("Current humidity in " + json.name + " (" + json.sys.country + ") is " + json.main.humidity + " %.", { typing: true });
          conversation.end();
          break;
        case "Wind speed":
          conversation.say("Current wind speed in " + json.name + " (" + json.sys.country + ") is " + json.wind.speed + " meter/sec.", { typing: true });
          conversation.end();
          break;
        case "Sunrise":
          currentSunrise(conversation, json);
          conversation.end();
          break;
        case "Sunset":
          conversation.say("Current sunset " + json.name + " (" + json.sys.country + ") is " + getTimeFromUnix(json.sys.sunset) + ".", { typing: true });
          conversation.end();
          break;
        default:
          conversation.say("Invalid selection", { typing: true });
          conversation.end();
          break;
      }
    });
  }, 2000)
}

function getTimeFromUnix(unixTime) {
  let date = new Date(unixTime * 1000);
  let hours = date.getHours();
  let minutes = "0" + date.getMinutes();
  let seconds = "0" + date.getSeconds();
  return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
}

function currentTemperature(conversation, json) {
  conversation.say("Current temperature in " + json.name + " (" + json.sys.country + ") is " + json.main.temp + " Celsius.\n" +
    "Current feels like temperature in " + json.name + " (" + json.sys.country + ") is " + json.main.feels_like + " Celsius.\n" +
    "Current minimum temperature in " + json.name + " (" + json.sys.country + ") is " + json.main.temp_min + " Celsius.\n" +
    "Current maximum temperature in " + json.name + " (" + json.sys.country + ") is " + json.main.temp_max + " Celsius.", { typing: true });
  conversation.end();
}

function currentSunrise(conversation, json) {
  conversation.say("Current sunrise in " + json.name + " (" + json.sys.country + ") is " + getTimeFromUnix(json.sys.sunrise) + ".", { typing: true });
  conversation.end();
}

function currentSunset(conversation, json) {
  conversation.say("Current sunset in " + json.name + " (" + json.sys.country + ") is " + getTimeFromUnix(json.sys.sunset) + ".", { typing: true });
  conversation.end();
}

function weather5dayForecast(conversation, json) {
  setTimeout(() => {
    conversation.ask({
      text: "What information about the future weather do you want?",
      quickReplies: ["Temperature", "General weather"],
      options: { typing: true }
    }, (payload, conversation) => {
      switch (payload.message.text) {
        case "Temperature":
          let temp = ""
          conversation.say("Current temperature in " + json.list[1].main.temp + " (" + json.city.name + " Celsius.", { typing: true });
          for (var i = 0; i < json.list.length; i++) {
            let pdate = json.list[i].dt_txt.substring(8, 10) + "." + json.list[i].dt_txt.substring(5, 7) + ". " + json.list[i].dt_txt.substring(11, 16);
            temp = (temp + pdate + " will be: " + json.list[i].main.temp + "°" + "\n")
          }
          conversation.say(temp);
          conversation.end();
          break;
        case "General weather":
          let pweather = ""
          for (var i = 0; i < json.list.length; i++) {
            let pdate = json.list[i].dt_txt.substring(8, 10) + "." + json.list[i].dt_txt.substring(5, 7) + ". " + json.list[i].dt_txt.substring(11, 16);
            pweather = (pweather + pdate + ": " + json.list[i].weather[0].description + "\n")
          }
          conversation.say(pweather);
          conversation.end();
          break;
        default:
          conversation.say("Invalid selection", { typing: true });
          conversation.end();
          break;
      }
    });
  }, 2000)
}

bot.on('message', (payload, chat) => {
  const text = payload.message.text;
  console.log(`The user said: ${text}`);
});

bot.start(port);
