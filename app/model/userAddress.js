'use strict';
const uuidv1 = require('uuid/v1');

module.exports = app => {
	const { STRING, INTEGER, UUID } = app.Sequelize;

	const userAddress = app.model.define(
		'userAddress',
		{
			id: {
				type: INTEGER,
				primaryKey: true,
				unique: true,
				allowNull: false,
				autoIncrement: true,
			},
			address: {
				type: STRING,
				allowNull: false,
			},
			stress: {
				type: STRING,
				allowNull: false,
			},
			user_id: {
				type: UUID,
				allowNull: false,
			},
			is_default: {
				type: INTEGER,
				allowNull: true,
				defaultValue: 0,
			},
			tel: {
				type: STRING,
				allowNull: false,
			},
			// 收货人姓名
			user_name: {
				type: STRING,
				allowNull: false,
			},
			// 0:男，1:女
			user_sex: {
				type: INTEGER,
				allowNull: true,
				defaultValue: 0,
			},
			// 0:公司，1:学校，2:家
			tag: {
				type: STRING,
				allowNull: true,
			},
		},
		{
			timestamps: false,
			tableName: 'user_address',
		},
	);

	userAddress.getList = function(id) {
		return this.findAll({
			where: { user_id: id },
			attributes: { exclude: ['user_id'] },
		});
	};

	userAddress.createItem = function(data) {
		return this.create({
			address: data.address,
			stress: data.stress,
			tel: data.tel,
			user_name: data.user_name,
			user_id: data.user_id,
			user_sex: data.user_sex,
			tag: data.tag,
		});
	};
	userAddress.updateItem = function(id, data) {
		return this.update(
			{
				address: data.address,
				tel: data.tel,
				user_name: data.user_name,
				user_sex: data.user_sex,
				tag: data.tag,
			},
			{ where: { id } },
		);
	};
	userAddress.deleteItem = function(id) {
		return this.destroy({ where: { id } });
	};
	userAddress.getItem = function(id) {
		return this.findOne({ where: { id } });
	};

	return userAddress;
};
