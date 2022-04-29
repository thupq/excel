module.exports = {
    exp_refer: {

    },
    fields: ['id', 'student_id', 'name', 'class_name', 'date_of_birth', 'gender', 'address','mobile_phone', 'is_active', 'created_time', 'created_by', 'updated_time', 'updated_by'],
    update_key: ['id'],
    import_field: [],
    mapping: [
        {index: 1, field: 'stt', required: false},
        {index: 2, field: 'student_id', required: false},
        {index: 3, field: 'name', required: true},
        {index: 4, field: 'class_name', required: false},
        {index: 5, field: 'date_of_birth', required: true},
        {index: 6, field: 'gender', required: true},
        {index: 7, field: 'address', required: true},
        {index: 8, field: 'mobile_phone', required: true}
    ],
    start_index: 10,
    result: {
        index: 9,
        field: 'result'
    }
}
