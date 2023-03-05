const fs = require('node:fs');
const path = require('node:path');
// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');
// Database Requirements
// const { Sequelize } = require('sequelize');
const { Guild, User, Drink } = require('./dbObjects.js');

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	}
	else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);

});

client.on(Events.GuildCreate, async guild => {
	// Create a new Guild Object
	await Guild.create({ guildId: guild.id, guildName: guild.name });
	// Fetch all the members in the guild
	const members = await guild.members.fetch();

	// Map the members to User objects and bulk insert them into the database
	const users = members.map((member) => ({
		userId: member.user.id,
		username: member.user.username,
		guildId: guild.id,
	}));

	await User.bulkCreate(users);
});
// Adds a new user to the dataset once they join the server
client.on(Events.GuildMemberAdd, async member => {
	await User.create({
		userId: member.user.id,
		username: member.user.username,
		guildId: member.guild.id,
	});
});

// Remove the User from the dataset if they leave the server.
client.on(Events.GuildMemberRemove, async member => {
	await Drink.destroy({ where: { buyerId: member.user.id } });
	await User.destroy({ where: { userId: member.user.id } });
});


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});
// Todo: add funny one liners when ppl mention themselves

client.on(Events.MessageCreate, async message => {
	if (message.content.includes('thanks for the drink') && message.mentions.users.size > 0) {
		const buyer = message.mentions.users.first();
		const recipient = message.author;

		if (buyer.equals(recipient)) {
			message.reply('Well you clearly had one too many');
		}
		// Check if buyer exists and handle accordingly
		else if (buyer) {
			await Drink.create({
				buyerId: buyer.id,
				recipientId: recipient.id,
			});
			message.reply(`You owe a drink to ${buyer}!`);
		}
	}
});


// Log in to Discord with your client's token
client.login(token);
