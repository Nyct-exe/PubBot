const { SlashCommandBuilder } = require('discord.js');
const { Drink, User } = require('../dbObjects.js');
const { EmbedBuilder } = require('discord.js');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('debt')
		.setDescription('Gives a list of people you owe drinks'),
	async execute(interaction) {
		// Finds all people the message author owes drinks
		const drinks = await Drink.findAll({
			attributes: [
				[sequelize.col('recipient.username'), 'recipient_username'],
				[sequelize.col('buyer.username'), 'buyer_username'],
				[sequelize.fn('COUNT', sequelize.col('*')), 'drink_count'],
			],
			include: [
				{ model: User, as: 'recipient', attributes: [] },
				{ model: User, as: 'buyer', attributes: [] },
			],
			where: {
				'$recipient.userId$': interaction.member.id,
			},
			group: ['buyer.userId'],
			having: sequelize.where(sequelize.fn('COUNT', sequelize.col('*')), '>', 0),
			raw: true,
		});

		const messageEmbed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Beverage Debts')
			.setDescription('List of people and how many drinks they bought you');
		if (drinks.length === 0) {
			messageEmbed.addFields(
				{ name: 'Message', value: 'Your Tab Is Empty', inline: true },
			);
		}
		else {
			drinks.forEach((drink) => {
				messageEmbed.addFields(
					{ name: `User: ${drink.buyer_username}`, value: `Drinks Bought: ${drink.drink_count}` },
				);
			});
		}
		await interaction.reply({ embeds: [messageEmbed], ephemeral: true });
	},
};
