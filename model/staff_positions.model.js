module.exports = (sequelize, Sequelize) => {
    const StaffPositions = sequelize.define("staff_positions");
    StaffPositions.init({
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        system_code: {
            type: Sequelize.STRING
        },
        staff_id: {
            type: Sequelize.INTEGER
        },
        position_id: {
            type: Sequelize.INTEGER
        },
        roles: {
            type: Sequelize.INTEGER
        },
        status: {
            type: Sequelize.INTEGER
        },
        action: {
            type: Sequelize.INTEGER
        },  
        reason: {
            type: Sequelize.INTEGER
        },  
        reason_detail: {
            type: Sequelize.INTEGER
        },  
        description: {
            type: Sequelize.STRING
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

    return StaffPositions;
};
