import Handsontable from 'handsontable';
import Ajv from 'ajv'

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
      // console.log(id,definition);
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
  for (var prop in schema.properties){
    // console.log ('prop', i, schema.properties.hasOwnProperty(i));
    if (schema.properties.hasOwnProperty(prop))
      columnDefs.push(getColDef(prop,schema.properties[prop]))
  }
  // console.log('properties',schema.properties,Object.getOwnPropertyNames(schema.properties));
  // TODO: translate schema into column definitions
  // "veggieName": {
  //   "type": "string",
  //   "description": "The name of the vegetable."
  // },
  // "veggieLike": {
  //   "type": "boolean",
  //   "description": "Do I like this vegetable?"
  // }
  // Object.getOwnPropertyNames(schema.properties).forEach(
  //   function (prop, idx, array) {
  //     console.log(prop + ' -> ' + schema.properties[prop]);
  //     columnDefs.push(getColDef(prop,schema.properties[prop]))
  //   }
  // );
  return columnDefs;
}


function schema2HotHeaders(schema){
  var headers = [];
  for (var prop in schema.properties){
    var header = prop;
    if (schema.properties.hasOwnProperty(prop) && schema.properties[prop].title){
      header = schema.properties[prop].title;
    }
    if (schema.properties.hasOwnProperty(prop) && schema.properties[prop].description){
      header = '<div title="'+schema.properties[prop].description+'">'+header+'</div>'
    }
    headers.push(header);
    console.log('headers', headers);
  }
  return headers; // Object.getOwnPropertyNames(schema.properties);
}


function HotSchemaTable(el, schema, data, options) {
  (function(Handsontable){
    function fakeValidator(query, callback) {
      //Always returns true.  Use this to make sure afterValidate fires.
      callback(true);//callback(/* Pass `true` or `false` based on your logic */);
    }

    // Register an alias
    Handsontable.validators.registerValidator('fake.validator', fakeValidator);

  })(Handsontable);
  var self = this;
  self.options = options ? options : {validateOnChange: false};
  self.el = el;
  self.ajv = new Ajv({allErrors: true}); // options can be passed, e.g. {allErrors: true}
  self.validate = self.ajv.compile(schema);
  self.updated = {};
  var errors = {};
  var error_rows = [];
  self.validateTable = function(all){
      if (!self.table)
        return;
      console.log('validateTable')
      function assignError(row,column,message){
        if (!errors[row][column])
          errors[row][column] = [];
        errors[row][column].push(message);
      }
      if (all){
        errors = {};
        error_rows = [];
      }

      var rows = all ? Array.from(Array(self.table.countSourceRows()).keys()) : self.updated ;
      console.log('validateRows',rows)
      for (var row in rows){
        if (rows.hasOwnProperty(row)) {
          delete errors[row];
          var rowData = self.table.getSourceDataAtRow(row);
          console.log('row data',rowData)
          var valid = self.validate(rowData);
          if (!valid){
              errors[row] = {};// = self.validate.errors;
              error_rows.push(row);
              self.validate.errors.forEach(function(error){
                if (error.params && error.params.missingProperty)
                  assignError(row,"."+error.params.missingProperty,'This field is required')
                else
                  assignError(row,error.dataPath,error.message)
              });
          }
          else{
            var index = error_rows.indexOf(row);
            if (index > -1)
              error_rows.splice(index,1);
          }
        }
      }
      console.log('errors',errors);
      console.log('error rows',error_rows);
      if (self.table)
        self.table.validateCells();//self.table.validateRows(Object.getOwnPropertyNames(errors))
  };
  self.hasErrors = function(){
    console.log('hasErrors',error_rows)
    return error_rows.length > 0;
  };
  self.addRow = function(){
    self.table.alter('insert_row');
  };
  self.removeRows = function(){
    var selection = self.table.getSelected();
    var remove = selection.map(function(s){
        return [s[0], (s[2]-s[0])+1];
    });
    console.log('remove',remove);
    self.table.alter('remove_row', remove) ;

  };

  self.logData = function(){
    var data = self.table.getSourceData();
    // console.log(data);
  };
  var columnDefs = schema2HotCols(schema);
  var colTypes = {};
  columnDefs.forEach(function(t){
    colTypes[t.data]=t.type;
  });
  self.table = new Handsontable(el, {
    data: data ? data : [{}],
    columns: schema2HotCols(schema),
    rowHeaders: true,
    comments: true,
    colHeaders: schema2HotHeaders(schema),
    contextMenu: ['copy', 'cut'],
    manualColumnResize: true,
    outsideClickDeselects: false,
    afterChange: function( changes, source ) {
      if (!self.options.validateOnChange)
        return;
      // console.log(changes)
      for (var i in changes){
        if(!self.updated[changes[i][0]])
          self.updated[changes[i][0]] = {};
        self.updated[changes[i][0]][changes[i][1]]=changes[i][3]

      }
      // console.log('updated',self.updated);
      self.validateTable(true);
    },
    beforeChange: (changes, source) => {
      //BEGIN JENKY FIXES FOR HOT VALUE ISSUES
      changes.forEach(function(change){
        var val = change[3];  // The new value
        switch(colTypes[change[1]]){
          case 'checkbox':
            if (val == 'true' || val == true)
              val = true
            else
              val = false
            break;
          case 'text':
          case 'numeric':
            if (val === '')
              val = undefined
        }
        change[3] = val;
      });
      //changes[0][3] = 10;
    },
    afterValidate: function(isValid, value, row, prop, source) {
  	//This is necessary because it passes in some context, unlike the custom validators which only give the value.
      // console.log(value,row,prop)
      var col = this.propToCol(prop);
      var path = '.'+prop;
      if (errors[row] && errors[row][path]){
        // console.log('error',row,path);
        self.commentsPlugin.setCommentAtCell(row, col, errors[row][path].join(', '));
        return false;
      }else
        self.commentsPlugin.removeCommentAtCell(row, col);
      return isValid;

    }
  });
  self.commentsPlugin = self.table.getPlugin('comments');
}

export default HotSchemaTable;
