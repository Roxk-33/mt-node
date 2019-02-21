'use strict';

module.exports = app => {
	const { INTEGER, BIGINT } = app.Sequelize;

	const shopCatalog = app.model.define(
		'shopCatalog',
		{
			id: {
				type: INTEGER,
				primaryKey: true,
				autoIncrement: true
			},
			label: BIGINT,
			shop_id: INTEGER,
			sort: INTEGER
		},
		{
			timestamps: false,
			tableName: 'shop_category'
		}
	);
	shopCatalog.associate = function() {
		shopCatalog.belongsTo(app.model.Shop, {
			foreignKey: 'shop_id',
			targetKey: 'id'
		});
	};

	return shopCatalog;
};
