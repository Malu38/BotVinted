// Import the required libraries
const Discord = require('discord.js');
const client = new Discord.Client();
const fetch = require('node-fetch');

// Define your bot's prefix
const PREFIX = '!';

// Define your bot's token
const token = process.env.DISCORD_BOT_TOKEN;

// Listen for when the bot is ready
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Listen for incoming messages
client.on('message', async (message) => {
  // Ignore messages from other bots and messages that don't start with the prefix
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  // Get the command and arguments from the message content
  const [command, ...args] = message.content.slice(PREFIX.length).trim().split(' ');

  // Handle the command
  switch (command) {
    case 'search':
      // Get the search term from the arguments
      const searchTerm = args.join(' ');

      // Send a response to let the user know we're searching for items
      const searchMsg = await message.channel.send(`Searching for items matching "${searchTerm}"...`);

      // Call the Vinted API to get the search results
      const searchUrl = `https://www.vinted.fr/api/v2/search?q=${encodeURIComponent(searchTerm)}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      // Check if there are any items matching the search term
      if (searchData.items.length > 0) {
        // Get the first item from the search results
        const item = searchData.items[0];

        // Send a response with the item's name and price
        const responseMsg = `I found an item matching "${searchTerm}": ${item.title} for ${item.price.amount} ${item.price.currency}.`;
        message.channel.send(responseMsg);
      } else {
        // Send a response if there are no items matching the search term
        message.channel.send(`I couldn't find any items matching "${searchTerm}".`);
      }

      // Delete the original search message
      searchMsg.delete();
      break;
    case 'buy':
      // Get the item ID from the arguments
      const itemId = args[0];

      // Call the Vinted API to purchase the item
      const buyUrl = `https://www.vinted.fr/api/v2/items/${itemId}/buy`;
      const buyResponse = await fetch(buyUrl, { method: 'POST' });
      const buyData = await buyResponse.json();

      // Send a response with the result of the purchase attempt
      if (buyData.success) {
        message.channel.send(`Successfully purchased item ${itemId}!`);
      } else {
        message.channel.send(`Failed to purchase item ${itemId}. Error: ${buyData.error}`);
      }
      break;
    default:
      // Send a response to the user if the command is not recognized
      message.channel.send(`Unknown command: ${command}`);
      break;
  }
});

// Log in to the Discord server with your bot's token
client.login(token);
