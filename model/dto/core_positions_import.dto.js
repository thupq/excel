module.exports = {
    pos_refer: {
        unit_0: {
            colIndex: 1,
            rowIndex: 2,
            fields: [
                {index: 1, field: 'dept_name'}
            ]
        },
        unit_1: {
            colIndex: 2,
            rowIndex: 2,
            fields: [
                {index: 1, field: 'dept_name'}
            ]
        },
        unit_2: {
            colIndex: 3,
            rowIndex: 2,
            fields: [
                {index: 1, field: 'dept_name'}
            ]
        },
        unit_3: {
            colIndex: 4,
            rowIndex: 2,
            fields: [
                {index: 1, field: 'dept_name'}
            ]
        },
        unit_4: {
            colIndex: 5,
            rowIndex: 2,
            fields: [
                {index: 1, field: 'dept_name'}
            ]
        },
        unit_5: {
            colIndex: 6,
            rowIndex: 2,
            fields: [
                {index: 1, field: 'dept_name'}
            ]
        },

        position_name: {
            colIndex: 8,
            rowIndex: 2,
            fields: [
                {index: 1, field: 'dict_name'}
            ]
        },

        job_position: {
            colIndex: 10,
            rowIndex: 2,
            fields: [
                {index: 1, field: 'dict_name'}
            ]
        },
        glone: {
            colIndex: 12,
            rowIndex: 2,
            fields: [
                {index: 1, field: 'dict_name'}
            ]
        },
        level: {
            colIndex: 14,
            rowIndex: 2,
            fields: [
                {index: 1, field: 'dict_name'}
            ]
        },
    },
    fields: ['id', 'system_code', 'dept_id', 'job_position', 'glone', 'level', 'coefficients_salary', 'effective_date', 'expired_date', 'is_active', 'created_time', 'created_by', 'updated_time', 'updated_by'],
    update_key: ['id'],
    import_field: [],
    mapping: [
        {index: 1, field: 'stt', required: false},
        {index: 2, field: 'system_code', required: false},
        {index: 3, field: 'unit_0', required: true},
        {index: 4, field: 'unit_1', required: false},
        {index: 5, field: 'unit_2', required: false},
        {index: 6, field: 'unit_3', required: false},
        {index: 7, field: 'unit_4', required: false},
        {index: 8, field: 'unit_5', required: false},
        {index: 9, field: 'name_position', required: true},
        {index: 10, field: 'job_position_str', required: true},
        {index: 11, field: 'glone_str', required: true},
        {index: 12, field: 'level_str', required: true},
        {index: 13, field: 'coefficients_salary', required: false},
        {index: 14, field: 'effective_date_str', required: true},
        {index: 15, field: 'expired_date_str', required: false},
    ],
    start_index: 9,
    result: {
        index: 16,
        field: 'result'
    }
}
