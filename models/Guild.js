const { Sequelize } = require('sequelize');

module.exports = (sequelize) => {
	const Guild = sequelize.define('guild', {
		guildId: {
			type: Sequelize.STRING,
			unique: true,
			primaryKey: true,
		},
		guildName: Sequelize.STRING,
	});

	return Guild;
};