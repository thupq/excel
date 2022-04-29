module.exports = {
  fields: ['id', 'dict_type_id', 'dict_name', 'dict_value', 'parent_id', 'additional_info', 'is_active', 'created_time', 'created_by', 'updated_time', 'updated_by'],
  update_key: ['id'],
  import_field: ["stt", 'dict_name_value', 'dict_type_name', 'dict_value', 'dict_name', 'parent_dict_name_value', 'parent_dict_type_name', 'parent_dict_value', 'parent_dict_name'],
  export_field: ['dict_name_value','dict_type_name','dict_value','dict_name','parent_type_value','parent_type_name', 'parent_value','parent_name'],
  mapping: [
    {index: 1, field: 'stt'},
    {index: 2, field: 'dict_name_value'},
    {index: 3, field: 'dict_type_name'},
    {index: 4, field: 'dict_value'},
    {index: 5, field: 'dict_name'},
    {index: 6, field: 'parent_dict_name_value'},
    {index: 7, field: 'parent_dict_type_name'},
    {index: 8, field: 'parent_dict_value'},
    {index: 9, field: 'parent_dict_name'}
  ],
  start_index: 6,
  result: {
    index: 10,
    field: 'result'
  }
}
