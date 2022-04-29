module.exports = {
    staff_positions_refer: {
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

        action: {
            colIndex: 8,
            rowIndex: 2,
            fields: [
                {index: 1, field: 'dict_name'}
            ]
        },

        position_name: {
            colIndex: 18,
            rowIndex: 2,
            fields: [
                {index: 1, field: 'dict_name'}
            ]
        },

        job_position: {
            colIndex: 20,
            rowIndex: 2,
            fields: [
                {index: 1, field: 'dict_name'}
            ]
        },


    },
    fields: ['id', 'system_code', 'staff_id', 'position_id', 'roles', 'status', 'action', 'reason', 'reason_detail', 'description', 'start_date', 'end_date', 'is_active', 'created_time', 'created_by', 'updated_time', 'updated_by'],
    update_key: ['id'],
    import_field: [],
    mapping: [
        {index: 1, field: 'stt'},
        {index: 2, field: 'system_code'},
        {index: 3, field: 'staff_code'},
        {index: 4, field: 'name'},
        {index: 5, field: 'unit_0'},
        {index: 6, field: 'unit_1'},
        {index: 7, field: 'unit_2'},
        {index: 8, field: 'unit_3'},
        {index: 9, field: 'unit_4'},
        {index: 10, field: 'unit_5'},
        {index: 11, field: 'name_position'},
        {index: 12, field: 'job_position_name'},
        {index: 13, field: 'action_name'},
        {index: 14, field: 'reason_name'},
        {index: 15, field: 'reason_detail_name'},
        {index: 16, field: 'description'},
        {index: 17, field: 'start_date'},
        {index: 18, field: 'end_date'},
    ],
    start_index: 9,
    result: {
        index: 19,
        field: 'result'
    }
}