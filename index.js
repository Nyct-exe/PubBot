const fs = require('node:fs');
const path = require('node:path');
// Require Sequelize
const Sequelize = require('sequelize');
// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

// Creating a Models


const Guild = sequelize.define('guild', {
	guildId: {
		type: Sequelize.STRING,
		unique: true,
		primaryKey: true,
	},
	guildName: Sequelize.STRING,
});

const User = sequelize.define('user', {
	userId: {
		type: Sequelize.STRING,
		unique: true,
		primaryKey: true,
	},
	username: Sequelize.STRING,
});

const Drink = sequelize.define('drink', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
});

// Relationships

Guild.hasMany(User);
User.belongsTo(Guild);

Drink.belongsTo(User, { as: 'buyer', foreignKey: 'buyer_id' });
Drink.belongsTo(User, { as: 'recipient', foreignKey: 'recipient_id' });


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
	Guild.sync();
	User.sync();
	Drink.sync();
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
		guildGuildId: guild.id,
	}));

	await User.bulkCreate(users);
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

// TODO: Breaks if the user is not mentioned needs addressing

client.on(Events.MessageCreate, async message => {
	if (message.content.includes('thanks for the drink')) {
		const buyer = message.mentions.users.first();
		const recipient = message.author;

		// Check if buyer exists and handle accordingly
		if (buyer) {
			await Drink.create({
				buyer_id: buyer.id,
				recipient_id: recipient.id,
			});
			message.reply(`You owe a drink to ${buyer}!`);
		}
	}
});

// Log in to Discord with your client's token
client.login(token);
