const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config()

// Bot installation DEV link
// https://discord.com/api/oauth2/authorize?client_id=1191750743720464445&permissions=8&scope=bot
// https://discord.com/oauth2/authorize?client_id=1191750743720464445&scope=bot+applications.commands&permissions=268822624
// Bot installation PROD link
// https://discord.com/api/oauth2/authorize?client_id=1197923779213533285&permissions=8&scope=bot


let client;

async function discordClient() {

//returns the active client if already created to be used in routes or other modules
if (client) {
	return client;
}

const token = process.env.DISCORD_BOT_SECRET;

client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildInvites,
      // Add intents here
    ],
  });

//-------------------------------------------------------------------//
//
// 				Adding commands to the client manager.
//
//-------------------------------------------------------------------//

client.commands = new Collection();
client.cooldowns = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

//---------------------------------------------------------------//
//
// 				Activating event listeners
//
//---------------------------------------------------------------//

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

//---------------------------------------------------------------//
//
// 				Logging to Discord with client's token
//
//---------------------------------------------------------------//

//LAUNCH CLIENT TO CONNECT TO DISCORD'S API
await client.login(token);

//returns the client created to be used in routes or other modules
return client;
// ACCESSING THE CLIENT BY CALLING THIS FUNCTION DOESN'T SEEM TO BE WORKING !!! TO CHECK

}

//calling connectToDiscord to launch client. This function returns "client" to be used to interact with discord using discordJS
discordClient();

module.exports = discordClient;