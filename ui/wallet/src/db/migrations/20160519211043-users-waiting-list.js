'use strict';

module.exports = {
    up(queryInterface, Sequelize) {
        queryInterface.addColumn('users', 'waiting_list', Sequelize.BOOLEAN);
        return queryInterface.addColumn('users', 'remote_ip', Sequelize.STRING);
    },

    down(queryInterface, Sequelize) {
        queryInterface.removeColumn('users', 'waiting_list');
        return queryInterface.removeColumn('users', 'remote_ip');
    },
};
