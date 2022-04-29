module.exports = {
    discipline_refer: {
        discipline_type: {
            colIndex: 1,
            rowIndex: 2,
            fields: [
                {index: 1, field: 'dict_name'}
            ]
        }
    },
    fields: ['id', 'system_code', 'staff_id', 'type', 'reward_type', 'discipline_type', 'effective_date', 'expired_date', 
        'decision_no', 'reason', 'form_of_reward', 'gif_in_kind', 'amount_money', 'salary_status', 'note', 'is_active',
        'created_time', 'created_by', 'updated_time', 'updated_by'],
    update_key: ['id'],
    mapping: [
        { index: 1, field: 'index' },
        { index: 2, field: 'system_code' },
        { index: 3, field: 'staff_code' },
        { index: 4, field: 'staff_name' },
        { index: 5, field: 'discipline_type' },
        { index: 6, field: 'decision_no' },
        { index: 7, field: 'effective_date' },
        { index: 8, field: 'expired_date' },
        { index: 9, field: 'reason' },
        { index: 10, field: 'amount_money' },
        { index: 11, field: 'salary_status' },
    ],
    start_index: 10,
    result: {
        index: 12,
        field: 'result'
    }
}