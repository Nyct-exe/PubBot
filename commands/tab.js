const { SlashCommandBuilder } = require('discord.js');
const { User } = require('../dbObjects.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tab')
		.setDescription('List of people and how many drinks they bought you'),
	async execute(interaction) {
		// Finds all people the message author owes drinks
		const user = await User.findOne({ where: { userId: interaction.member.id } });
		if (user) {
			const userTab = await user.getTab();
			const messageEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle('Pub Tab')
				.setDescription('List of people and how many drinks they bought you');
			if (userTab.length === 0) {
				messageEmbed.addFields(
					{ name: 'Message', value: 'Your Tab Is Empty', inline: true },
				);
			}
			else {
				userTab.forEach((drink) => {
					messageEmbed.addFields(
						{ name: `User: ${drink.buyer_username}`, value: `Got You ${drink.drink_count} Drinks` },
					);
				});
			}
			await interaction.reply({ embeds: [messageEmbed], ephemeral: true });
		}
	},
};
