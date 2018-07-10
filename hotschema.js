
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


function HotSchemaTable(el, schema, data) {
  var self = this;
  self.el = el;
  self.ajv = new Ajv({allErrors: true}); // options can be passed, e.g. {allErrors: true}
  self.validate = self.ajv.compile(schema);
  self.updated = {};
  self.errors = {};
  self.validateTable = function(){
      // getSourceDataAtRow
      // validateRows
      function assignError(row,column,message){
        if (!self.errors[row][column])
          self.errors[row][column] = [];
        self.errors[row][column].push(message);
      }
      Object.getOwnPropertyNames(self.updated).forEach(
        function (row) {
          delete self.errors[row];
          console.log(self.updated[row]);
          // console.log(prop + ' -> ' + schema.properties[prop]);
          // columnDefs.push(getColDef(prop,schema.properties[prop]))
          var rowData = self.table.getSourceDataAtRow(row);
          var valid = self.validate(rowData);
          if (!valid){
              self.errors[row] = {};// = self.validate.errors;
              self.validate.errors.forEach(function(error){
                if (error.params && error.params.missingProperty)
                  assignError(row,"."+error.params.missingProperty,'This field is required')
                else
                  assignError(row,error.dataPath,error.message)
              });
          }
          else
            delete self.errors[row];
            //self.commentsPlugin.setCommentAtCell(row, this.propToCol(prop), message);
            //self.commentsPlugin.removeCommentAtCell(row, this.propToCol(prop), message);
        }
      );
      console.log('errors',self.errors);
      if (self.table)
        self.table.validateCells();//self.table.validateRows(Object.getOwnPropertyNames(self.errors))
  };
  self.addRow = function(){
    self.table.alter('insert_row');
  };
  self.logData = function(){
    var data = self.table.getSourceData();
    console.log(data);
  }
  self.table = new Handsontable(el, {
    data: data ? data : [{}],
    columns: schema2HotCols(schema),
    rowHeaders: true,
    comments: true,
    colHeaders: schema2HotHeaders(schema),
    contextMenu: ['copy', 'cut'],
    manualColumnResize: true,
    afterChange: function( changes, source ) {
      console.log(changes)
      for (var i in changes){
        if(!self.updated[changes[i][0]])
          self.updated[changes[i][0]] = {};
        self.updated[changes[i][0]][changes[i][1]]=changes[i][3]

      }
      console.log('updated',self.updated);
      self.validateTable();
    },
    afterValidate: function(isValid, value, row, prop, source) {
  	//This is necessary because it passes in some context, unlike the custom validators which only give the value.
      console.log(value,row,prop)
      var col = this.propToCol(prop);
      var path = '.'+prop;
      if (self.errors[row] && self.errors[row][path]){
        console.log('error',row,path);
        self.commentsPlugin.setCommentAtCell(row, col, self.errors[row][path].join(', '));
        return false;
      }else
        self.commentsPlugin.removeCommentAtCell(row, col);
      return isValid;


      //
      // if (self.errors[row]){
      //   valid = true;
      //   for(var i in self.validate.errors){
      //     if (self.validate.errors[i].dataPath == '.'+prop){
      //       valid = false;
      //       message = self.validate.errors[i].message;
      //     }
      //
      //   }
      //   if (!valid){
      //     console.log(JSON.stringify(self.validate.errors));
      //     console.log('Invalid: ' + self.ajv.errorsText(self.validate.errors));
      //     self.commentsPlugin.setCommentAtCell(row, this.propToCol(prop), message);
      //   }
      //   else {
      //     self.commentsPlugin.removeCommentAtCell(row, this.propToCol(prop), message);
      //   }
      // }
      // return valid && isValid;
    }
  });
  self.commentsPlugin = self.table.getPlugin('comments');
}
