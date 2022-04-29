module.exports = (sequelize, Sequelize) => {
    const RewardAndDiscipline = sequelize.define("reward_and_discipline");
    RewardAndDiscipline.init({
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
        type: {
            type: Sequelize.INTEGER
        },  
        reward_type: {
            type: Sequelize.INTEGER
        },
        discipline_type: {
            type: Sequelize.INTEGER
        },
        effective_date: {
            type: Sequelize.DATE
        },  
        expired_date: {
            type: Sequelize.DATE
        },
        decision_no: {
            type: Sequelize.STRING
        },
        reason: {
            type: Sequelize.STRING
        },
        form_of_reward:{
            type: Sequelize.INTEGER
        },  
        gif_in_kind: {
            type: Sequelize.STRING
        },
        amount_money: {
            type: Sequelize.INTEGER
        },
        salary_status: {
            type: Sequelize.INTEGER
        },
        note: {
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
        updated_time: {
            type: Sequelize.DATE
        },
        updated_by: {
            type: Sequelize.STRING
        },
    }, {sequelize, freezeTableName: true});

    return RewardAndDiscipline;
};
