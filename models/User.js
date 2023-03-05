const { Sequelize } = require('sequelize');

module.exports = (sequelize) => {
	const User = sequelize.define('user', {
		userId: {
			type: Sequelize.STRING,
			unique: true,
			primaryKey: true,
		},
		username: Sequelize.STRING,
	});

	return User;
};