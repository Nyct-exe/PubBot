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

// // Relationships
Guild.hasMany(User, { as: 'user', foreignKey: 'guildId' });
User.belongsTo(Guild, { as: 'guild', foreignKey: 'guildId' });

Drink.belongsTo(User, { as: 'buyer', foreignKey: 'buyerId' });
Drink.belongsTo(User, { as: 'recipient', foreignKey: 'recipientId' });

// Allows to remake the database with -f flag.

const force = process.argv.includes('--force') || process.argv.includes('-f');


sequelize.sync({ force }).then(async () => {
	console.log('Database synced');
	sequelize.close();
}).catch(console.error);

