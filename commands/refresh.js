const { SlashCommandBuilder } = require('discord.js');
const { User, Guild } = require('../dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('refresh')
		.setDescription('Refreshes Database'),
	async execute(interaction) {
        // Delete guild for safety
        await Guild.destroy({ where: { guildId: interaction.guildId } });
        // Create a new Guild Object
        await Guild.create({ guildId: interaction.guildId, guildName: interaction.member.guild.name });
        // Fetch all the members in the guild
        const members = await interaction.member.guild.members.fetch();

        // Map the members to User objects and bulk insert them into the database
        const users = members.map((member) => ({
            userId: member.user.id,
            username: member.user.username,
            guildId: interaction.guildId,
        }));

        await User.bulkCreate(users);
        await interaction.reply({ content:"Refreshed Database", ephemeral: true });
	},
    
};
