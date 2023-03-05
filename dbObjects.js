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
Guild.hasMany(User, { as: 'user', foreignKey: 'guildId' });
User.belongsTo(Guild, { as: 'guild', foreignKey: 'guildId' });

Drink.belongsTo(User, { as: 'buyer', foreignKey: 'buyerId' });
Drink.belongsTo(User, { as: 'recipient', foreignKey: 'recipientId' });
// TODO: Define Properties


module.exports = { Guild, User, Drink };
