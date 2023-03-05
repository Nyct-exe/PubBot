const { Sequelize } = require('sequelize');

module.exports = (sequelize) => {
	const Drink = sequelize.define('drink', {
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
	});

	return Drink;
};