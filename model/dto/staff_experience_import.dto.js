module.exports = {
    exp_refer: {

    },
    fields: ['id', 'system_code', 'staff_id', 'start_date', 'end_date', 'company', 'position', 'is_active', 'created_time', 'created_by', 'updated_time', 'updated_by'],
    update_key: ['id'],
    import_field: [],
    mapping: [
        {index: 1, field: 'stt', required: false},
        {index: 2, field: 'system_code', required: false},
        {index: 3, field: 'staff_code', required: true},
        {index: 4, field: 'full_name', required: false},
        {index: 5, field: 'start_date', required: true},
        {index: 6, field: 'end_date', required: true},
        {index: 7, field: 'company', required: true},
        {index: 8, field: 'position', required: true}
    ],
    start_index: 10,
    result: {
        index: 9,
        field: 'result'
    }
}
