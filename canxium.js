const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

// Replace YOUR_API_TOKEN with the API token you received from BotFather
const API_TOKEN = "YOURAPITOKEN";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(API_TOKEN, {
  polling: {
    interval: 1000,
    params: {
      timeout: 60,
    },
  },
});
bot.on("message", (message) => {
  //console.log(message);
});
bot.on("polling_error", (error) => {
  //console.log("Polling error:", error);
});

//info
bot.onText(/\/info/, async (msg) => {
  const chatId = msg.chat.id;
  const messg =
    "On links below you will find all information about CAU";
  const dist = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🔗 Canxium website",
            url: "https://canxium.org",
          },
        ],
        [
          {
            text: "🔗 Canxium whitepaper",
            url: "https://canxium.org/pdf/whitepaper.pdf",
          },
        ],
        [
          {
            text: "🔗 Medium",
            url: "https://canxium.medium.com/",
          },
        ],
        [
          {
            text: "🔗 Twitter",
            url: "https://twitter.com/canxiumchain",
          },
        ],
      ],
    },
  };
  bot.sendMessage(chatId, messg, { parse_mode: "Markdown", ...dist });
});

// Listen for the /price command
bot.onText(/\/price/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    await readAndParseData(chatId);
  } catch (err) {
    bot.sendMessage(chatId, "An error occurred while fetching the price.");
  }
});

async function readAndParseData(chatId) {
  try {
    const pricexeggex = await axios.get('https://xeggex.com/api/v2/ticker/CAU_USDT');
    const supply = await axios.get('https://supply.canxium.org/info/cau?q=totalSupply');
    const jsonData = pricexeggex.data;
    const supplyData = supply.data;
    const lastPrice = jsonData.last_price;
    const totalSupply = parseFloat(supplyData);
          
          const value = lastPrice * totalSupply;
          let mcap;

          if (value >= 1000000) {
            mcap = (value / 1000000).toFixed(4) + "M $";
          } else if (value >= 1000) {
            mcap = (value / 1000).toFixed(4) + "K $";
          } else {
            mcap = value.toFixed(4);
          }

    const lines = [
      `💵 Price: ${parseFloat(lastPrice).toFixed(4)} $`,
      `💰 Market Cap: ${mcap}`,
      `🪙 Coin Supply: ${totalSupply.toFixed(4)} CAU`,
    ];

    const longestLineLength = Math.max(...lines.map((line) => line.length));
    const alignedLines = lines.map((line) => line.padEnd(longestLineLength, " "));
    const alignedMessage = alignedLines.join("\n");

    const keyboards = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🔗 Xeggex Exchange",
              url: "https://xeggex.com/market/CAU_USDT",
            },
          ],
          [
            {
              text: "🔗 Live Coin Watch",
              url: "https://www.livecoinwatch.com/price/Canxium-CAU",
            },
          ],
        ],
      },
    };

    bot.sendMessage(
      chatId,
      alignedMessage,
      { parse_mode: "Markdown", ...keyboards },
      (err) => {
        if (err) {
          //console.error("Error sending message:", err);
          return;
        }
      }
    );
  } catch (err) {
    //console.error("Error fetching or parsing JSON data:", err);
  }
}
