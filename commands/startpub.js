const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('startpub')
		.setDescription('Starts a pub event for your wetherspoons session.'),
	async execute(interaction) {
		await interaction.reply('Lets get Drunk!');
	},
};
