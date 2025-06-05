const { Events } = require('discord.js');
const checkEmbedsBasic = require('../Dailytwisted.js');
module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);


		await checkEmbedsBasic();
	},
};
