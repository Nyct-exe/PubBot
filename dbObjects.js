const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

// Sequelize Models
const Guild = require('./models/Guild.js')(sequelize);
const User = require('./models/User.js')(sequelize);
const Drink = require('./models/Drink.js')(sequelize);


// If I don't add this here too it foreign keys are not saved...
Guild.hasMany(User, { as: 'user', foreignKey: 'guildId', onDelete: 'CASCADE' });
User.belongsTo(Guild, { as: 'guild', foreignKey: 'guildId' });

Drink.belongsTo(User, { as: 'buyer', foreignKey: 'buyerId', onDelete: 'CASCADE' });
Drink.belongsTo(User, { as: 'recipient', foreignKey: 'recipientId', onDelete: 'CASCADE' });

// Gets a list of users who the Invoked user owes drinks to
// Also Checks that both users are from the same server
Reflect.defineProperty(User.prototype, 'getTab', {
	value: function getTab() {
		return Drink.findAll({
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
				'$recipient.userId$': this.userId,
				'$recipient.guildId$': this.guildId,
			},
			group: ['buyer.userId'],
			having: sequelize.where(sequelize.fn('COUNT', sequelize.col('*')), '>', 0),
			raw: true,
		});
	},
});

// Gets a list of users who owe drinks to the Invoked User
// Also Checks that both users are from the same server
Reflect.defineProperty(User.prototype, 'getDebtors', {
	value: function getDebtors() {
		return Drink.findAll({
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
				'$buyer.userId$': this.userId,
				'$buyer.guildId$': this.guildId,
			},
			group: ['recipient.userId'],
			having: sequelize.where(sequelize.fn('COUNT', sequelize.col('*')), '>', 0),
			raw: true,
		});
	},
});


module.exports = { Guild, User, Drink };
