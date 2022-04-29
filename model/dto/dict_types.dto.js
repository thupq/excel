module.exports = {
  fields: ['id', 'dict_name_value', 'dict_type_name', 'is_active', 'created_time', 'created_by', 'updated_time', 'updated_by'],
  update_key: ['id'],
  import_field: ["stt", 'dict_name_value', 'dict_type_name'],
  export_field: ['dict_name_value', 'dict_type_name'],
  mapping: [
    {index: 1, field: 'stt'},
    {index: 2, field: 'dict_name_value'},
    {index: 3, field: 'dict_type_name'}
  ],
  start_index: 7,
  result: {
    index: 4,
    field: 'result'
  }

}
