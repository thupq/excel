module.exports = (sequelize, Sequelize) => {
    const StrategicStaffing = sequelize.define("stategic_staffing");
    StrategicStaffing.init({
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        system_code: {
            type: Sequelize.STRING
        },
        position_id: {
            type: Sequelize.INTEGER
        },
        strategy: {
            type: Sequelize.INTEGER
        },
        start_date: {
            type: Sequelize.DATE
        },
        end_date: {
            type: Sequelize.DATE
        },
        is_active: {
            type: Sequelize.INTEGER
        },
        created_time: {
            type: Sequelize.DATE
        },
        created_by: {
            type: Sequelize.STRING
        },
        updated_time: {
            type: Sequelize.DATE
        },
        updated_by: {
            type: Sequelize.STRING
        },
    }, {sequelize, freezeTableName: true});

    return StrategicStaffing;
};
