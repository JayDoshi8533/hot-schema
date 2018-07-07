
(function(Handsontable){
  function fakeValidator(query, callback) {
    //Always returns true.  Use this to make sure afterValidate fires.
    callback(true);//callback(/* Pass `true` or `false` based on your logic */);
  }

  // Register an alias
  Handsontable.validators.registerValidator('fake.validator', fakeValidator);

})(Handsontable);

function getCols(schema,path){
  // TODO: pull out the specific path
  return schema;
}
function getColDef(id,definition){
  switch (definition.type) {
    case 'string':
      if (definition.enum)
        return {data:id,type:'dropdown',source:definition.enum,validator:'fake.validator'};
      else
        return {data:id,type:'text',validator:'fake.validator'};
    case 'number':
      return {data:id,type:'numeric',validator:'fake.validator'};
    case 'boolean':
      return {data:id,type:'checkbox',allowInvalid:false,validator:'fake.validator'};
    case 'array':
      var def = {data:id,type:'dropdown',validator:'fake.validator'};
      if (definition.items && definition.items.enum)
        def.source = definition.items.enum;
      return def;
    default:
      console.log(id,definition);
      throw 'Unsupported type ' + definition.type;
  }
}
// function getValidators(schema){
//   var validators = {};
//   Object.getOwnPropertyNames(schema.properties).forEach(
//     function (prop, idx, array) {
//       console.log(prop + ' -> ' + schema.properties[prop]);
//       columnDefs.push(getColDef(prop,schema.properties[prop]))
//     }
// }
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
