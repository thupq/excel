module.exports = {
    cer_refer: {
        carer: {
            colIndex: 1,
            rowIndex: 2,
            fields: [
                {index: 1, field: 'dict_name'}
            ]
        },
        specialized: {
            colIndex: 3,
            rowIndex: 2,
            fields: [
                {index: 1, field: 'dict_name'}
            ]
        },
        classification: {
          colIndex: 5,
          rowIndex: 2,
          fields: [
              {index: 1, field: 'dict_name'}
          ]
      }
    },
    fields: ['id', 'system_code', 'staff_id', 'training_place', 'major', 'specialist', 'classification', 'graduation_date','certificate', 'date_of_issue', 'expired_date', 'is_active', 'created_time', 'created_by', 'updated_time', 'updated_by'],
    update_key: ['id'],
    import_field: [],
    mapping: [
        {index: 1, field: 'stt', required: false},
        {index: 2, field: 'system_code', required: false},
        {index: 3, field: 'staff_code', required: true},
        {index: 4, field: 'full_name', required: false},
        {index: 5, field: 'type', required: true},
        {index: 6, field: 'training_place', required: true},
        {index: 7, field: 'major', required: true},
        {index: 8, field: 'specialist', required: true},
        {index: 9, field: 'classification', required: true},
        {index: 10, field: 'graduation_date', required: false},
        {index: 11, field: 'certificate', required: true},
        {index: 12, field: 'date_of_issue', required: true},
        {index: 13, field: 'expired_date', required: false}
    ],
    start_index: 10,
    result: {
        index: 14,
        field: 'result'
    }
}
