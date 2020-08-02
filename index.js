const { Telegraf } = require("telegraf");
const cron = require("node-cron");
const fetch = require("node-fetch");

const openWeatherToken = "e4be0cd4a75788a1cee38dbb08118871";
const tgBotToken = "1114449845:AAEru3S7ZO_sZssM9BQ_3FX9UgkMhwFlUv8";
const dtfToken = `e10b25296d83657a4ccf1261f30df34f009d5e59de3682f6419c2233e773a190`;

const monthesLocale = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const getWeather = async () => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=Kyiv&units=metric&appid=${openWeatherToken}`
  );
  const result = await response.json();

  const message =
    "*Погода*\n" +
    result.weather[0].description +
    "\nТемпература: " +
    Math.floor(result.main.temp) +
    "\nОщущается как: " +
    Math.floor(result.main.feels_like) +
    "\nВлажность: " +
    result.main.humidity +
    "%\n";

  return message;
};

const getNews = async () => {
  const response = await fetch(
    `https://api.dtf.ru/v1.9/timeline/index/popular?count=3`,
    {
      headers: { "X-Device-Token": dtfToken },
    }
  );

  const resJson = await response.json();

  return resJson.result;
};

const prepareData = async () => {
  const date = new Date();

  let result = `*Доброе утро, кожаный мешок* 👾 \nСегодня ${date.getDate()} ${
    monthesLocale[date.getMonth()]
  } \n\n`;

  const weather = await getWeather();
  const news = await getNews();

  result += weather;

  let newsStr = "\nА вот и лучшие материалы с ДТФ на утро: \n";

  news.forEach((item) => {
    newsStr += `\n[${item.title || "Нет тайтла"}](${item.url})`;
  });

  result += newsStr;

  return result;
};

const bot = new Telegraf(tgBotToken);

bot.start((ctx) => {
  ctx.reply(
    "Привет, каждый день в 8 утра я буду присылать тебе три главных новости и прогноз погоды на сегодня. "
  );

  cron.schedule("0 8 * * *", async () => {
    // cron.schedule("*/10 * * * * *", async () => {
    const message = await prepareData();

    console.log(message);

    ctx.replyWithMarkdown(message);
  });
});

bot.launch();
