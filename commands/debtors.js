const { SlashCommandBuilder } = require('discord.js');
const { User } = require('../dbObjects.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('debtors')
		.setDescription('List of people who owe you a drink'),
	async execute(interaction) {
		// Finds all people the message author owes drinks
		const user = await User.findOne({ where: { userId: interaction.member.id } });
		if (user) {
			const userDebtors = await user.getDebtors();
			const messageEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle('Debt Tab')
				.setDescription('List of people who owe you a drink');
			if (userDebtors.length === 0) {
				messageEmbed.addFields(
					{ name: 'Message', value: 'Your Tab Is Empty', inline: true },
				);
			}
			else {
				userDebtors.forEach((drink) => {
					messageEmbed.addFields(
						{ name: `User: ${drink.recipient_username}`, value: `Drinks Owed: ${drink.drink_count}` },
					);
				});
			}
			await interaction.reply({ embeds: [messageEmbed], ephemeral: true });
		}
	},
};
