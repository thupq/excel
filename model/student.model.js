module.exports = (sequelize, Sequelize) => {
    const Student = sequelize.define("tbl_student");
    Student.init({
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        student_id: {
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING
        },
        class_name: {
            type: Sequelize.STRING
        },
        date_of_birth: {
            type: Sequelize.DATE
        },
        gender: {
            type: Sequelize.INTEGER
        },
        address: {
            type: Sequelize.STRING
        },
        mobile_phone: {
            type: Sequelize.STRING
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
        updated_by: {
            type: Sequelize.STRING
        },
        updated_time: {
            type: Sequelize.DATE
        }
    }, {sequelize, freezeTableName: true});

    return Student;
};
