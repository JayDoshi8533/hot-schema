function getCols(schema,path){
  // TODO: pull out the specific path
  return schema;
}
function getColDef(id,definition){
  switch (definition.type) {
    case 'string':
      return {data:id,type:'text'};
    case 'number':
      return {data:id,type:'numeric'};
    case 'boolean':
      return {data:id,type:'checkbox'};
    case 'array':
      var def = {data:id,type:'dropdown'};
      if (definition.items && definition.items.enum)
        def.source = definition.items.enum;
      return def;
    default:
      console.log(id,definition);
      throw 'Unsupported type ' + definition.type;
  }
}
function schema2HotCols(schema){
  var columnDefs = [];
  // TODO: translate schema into column definitions
  // "veggieName": {
  //   "type": "string",
  //   "description": "The name of the vegetable."
  // },
  // "veggieLike": {
  //   "type": "boolean",
  //   "description": "Do I like this vegetable?"
  // }
  Object.getOwnPropertyNames(schema.properties).forEach(
    function (prop, idx, array) {
      console.log(prop + ' -> ' + schema.properties[prop]);
      columnDefs.push(getColDef(prop,schema.properties[prop]))
    }
);
  return columnDefs;
}


function schema2HotHeaders(schema){
  return Object.getOwnPropertyNames(schema.properties);
}
