const { Events } = require('discord.js');
const embedLoader = require('./embed-loader');

await embedLoader();

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};
