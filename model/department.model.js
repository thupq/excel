module.exports = (sequelize, Sequelize) => {
    const Departments = sequelize.define("core_departments");
    Departments.init({
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        system_code: {
            type: Sequelize.STRING
        },
        dep_code: {
            type: Sequelize.STRING
        },
        dep_name: {
            type: Sequelize.STRING
        },
        level: {
            type: Sequelize.STRING
        },
        parent_id: {
            type: Sequelize.STRING
        },
        cost_center: {
            type: Sequelize.STRING
        },
        path: {
            type: Sequelize.STRING
        },
        is_active: {
            type: Sequelize.STRING
        },
        created_time: {
            type: Sequelize.DATE
        },
        created_by: {
            type: Sequelize.STRING
        },
        updated_by: {
            type: Sequelize.STRING
        },
        updated_time: {
            type: Sequelize.DATE
        },
        effective_date: {
            type: Sequelize.DATE
        },
        expired_date: {
            type: Sequelize.DATE
        },
        dept_type: {
            type: Sequelize.INTEGER
        },
    }, {sequelize, freezeTableName: true});

    return Departments;
};
