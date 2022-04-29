module.exports = {
  contract_refer: {
    contract_type: {
      colIndex: 1,
      rowIndex: 2,
      fields: [
        {index: 1, field: 'dict_name'}
      ]
    }
  },
  fields: ['id', 'staff_id', 'system_code', 'contract_type', 'contract_no', 'signer', 'effective_date', 'expired_date','is_active', 'created_time', 'created_by', 'updated_time', 'updated_by'],
  update_key: ['id'],
  import_field: ["stt", 'system_code', 'staff_code', 'full_name', 'contract_type', 'contract_no', 'effective_date', 'expired_date', 'signer'],
  export_field: [],
  mapping: [
    {index: 1, field: 'stt', required: false},
    {index: 2, field: 'system_code', required: false},
    {index: 3, field: 'staff_code', required: true},
    {index: 4, field: 'full_name', required: false},
    {index: 5, field: 'contract_type_str', required: true},
    {index: 6, field: 'contract_no', required: true},
    {index: 7, field: 'effective_date', required: true},
    {index: 8, field: 'expired_date', required: false},
    {index: 9, field: 'signer', required: true}
  ],
  start_index: 10,
  result: {
    index: 10,
    field: 'result'
  }
}
