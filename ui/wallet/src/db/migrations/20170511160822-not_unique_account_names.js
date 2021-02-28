'use strict';

module.exports = {
    up (queryInterface, Sequelize) {
        queryInterface.removeIndex('accounts', ['name']);
        return queryInterface.addIndex('accounts', ['name']);
    },

    down (queryInterface, Sequelize) {},
};
