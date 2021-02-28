'use strict';

module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.addColumn(
            'users',
            'creation_hash',
            Sequelize.STRING
        );
    },

    down (queryInterface, Sequelize) {
        return queryInterface.removeColumn('users', 'creation_hash');
    },
};
