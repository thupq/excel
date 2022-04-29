module.exports = {
    relative_refer: {
        city: {
            colIndex: 5,
            rowIndex: 2,
            fields: [
                {index: 1, field: 'dict_name'}
            ]
        },
        district: {
            colIndex: 7,
            rowIndex: 2,
            fields: [
                {index: 1, field: 'dict_name'}
            ]
        },
        ward: {
            colIndex: 9,
            rowIndex: 2,
            fields: [
                {index: 1, field: 'dict_name'}
            ]
        }
    },
    fields: ['id', 'system_code', 'staff_id', 'name', 'date_of_birth', 'relation', 'is_dependant', 'citizen_id_no','pti_tax_code', 'gender', 'birth_certificate_no', 'birth_certificate_book_no','place_of_residence','place_of_residence_detail','effective_month','expired_month','is_active', 'created_time', 'created_by', 'updated_time', 'updated_by'],
    update_key: ['id'],
    import_field: [],
    mapping: [
        {index: 1, field: 'stt', required: false},
        {index: 2, field: 'system_code', required: false},
        {index: 3, field: 'staff_code', required: true},
        {index: 4, field: 'full_name', required: false},
        {index: 5, field: 'name', required: true},
        {index: 6, field: 'date_of_birth', required: true},
        {index: 7, field: 'relation_str', required: true},
        {index: 8, field: 'is_dependant_str', required: true},
        {index: 9, field: 'citizen_id_no', required: false},
        {index: 10, field: 'pti_tax_code', required: false},

        {index: 11, field: 'gender_str', required: true},
        {index: 12, field: 'birth_certificate_no', required: false},
        {index: 13, field: 'birth_certificate_book_no', required: false},
        {index: 14, field: 'nationality_str', required: true},
        {index: 15, field: 'province_str', required: false},
        {index: 16, field: 'district_str', required: false},
        {index: 17, field: 'ward_str', required: false},
        {index: 18, field: 'place_of_residence_detail', required: false},
        {index: 19, field: 'effective_month', required: true},
        {index: 20, field: 'expired_month', required: false}
    ],
    start_index: 10,
    result: {
        index: 21,
        field: 'result'
    }
}
