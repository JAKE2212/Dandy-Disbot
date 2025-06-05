const { Events } = require('discord.js');
const { checkEmbedsBasic, standbyUntil8PM  } = require('./Dailytwisted.js')

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		checkEmbedsBasic();
		standbyUntil8PM(client);
	},
};
