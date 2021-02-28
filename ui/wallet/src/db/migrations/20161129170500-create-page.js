'use strict';
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface
            .createTable('pages', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                permlink: { type: Sequelize.STRING(256) },
                views: { type: Sequelize.INTEGER },
                created_at: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
            })
            .then(() => {
                queryInterface.addIndex('pages', ['permlink'], {
                    indicesType: 'UNIQUE',
                });
            });
    },
    down (queryInterface, Sequelize) {
        return queryInterface.dropTable('pages');
    },
};
