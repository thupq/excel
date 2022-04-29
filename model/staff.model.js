module.exports = (sequelize, Sequelize) => {
    const Staffs = sequelize.define("core_staff");
    Staffs.init({
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        staff_id: {
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING
        },
        date_of_employment: {
            type: Sequelize.DATE
        },
        end_date_of_employment: {
            type: Sequelize.DATE
        },
        date_of_birth: {
            type: Sequelize.DATE
        },
        gender: {
            type: Sequelize.INTEGER
        },
        citizen_id_no: {
            type: Sequelize.STRING
        },
        date_of_issue: {
            type: Sequelize.DATE
        },
        place_of_issue: {
            type: Sequelize.STRING
        },
        marital_status: {
            type: Sequelize.INTEGER
        },
        country_of_origin: {
            type: Sequelize.INTEGER
        },
        nationality: {
            type: Sequelize.INTEGER
        },
        ethnic: {
            type: Sequelize.INTEGER
        },
        religion: {
            type: Sequelize.INTEGER
        },
        graduated: {
            type: Sequelize.INTEGER
        },
        business_email: {
            type: Sequelize.STRING
        },
        private_email: {
            type: Sequelize.STRING
        },
        mobile_phone: {
            type: Sequelize.STRING
        },
        ext: {
            type: Sequelize.STRING
        },
        contact_for_emergency: {
            type: Sequelize.STRING
        },
        emergency_contact_address: {
            type: Sequelize.STRING
        },
        emergency_contact_number: {
            type: Sequelize.STRING
        },
        permanent_address: {
            type: Sequelize.INTEGER
        },
        permanent_address_detail: {
            type: Sequelize.STRING
        },
        contact_address: {
            type: Sequelize.INTEGER
        },
        contact_address_detail: {
            type: Sequelize.STRING
        },
        pit_tax_code: {
            type: Sequelize.STRING
        },
        social_insurance_cod: {
            type: Sequelize.STRING
        },
        work_permit_no: {
            type: Sequelize.STRING
        },
        work_permit_start_date: {
            type: Sequelize.DATE
        },
        work_permit_end_date: {
            type: Sequelize.DATE
        },
        is_active: {
            type: Sequelize.INTEGER
        },
        health_check_book_no: {
            type: Sequelize.STRING
        },
        work_permit_title: {
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
        }
    }, {sequelize, freezeTableName: true});

    return Staffs;
};
