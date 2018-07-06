var example_schemas = {};
example_schemas.veggies = {
  "id": "https://example.com/arrays.schema.json",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "description": "Veggies",
  "type": "object",
  "properties": {
    "vegetables": {
      "type": "array",
      "items": { "$ref": "#/definitions/veggie" }
    }
  },
  "definitions": {
    "veggie": {
      "type": "object",
      "required": [ "veggieName", "veggieLike" ],
      "properties": {
        "veggieName": {
          "type": "string",
          "description": "The name of the vegetable."
        },
        "veggieLike": {
          "type": "boolean",
          "description": "Do I like this vegetable?"
        },
        "score": {
          "type": "number",
          "description": "Rate from 1-10",
          "minimum": 0,
          "maximum": 100,
        },
        "color":{
          "type":"array",
          "items":{
            "enum":["green","red","yellow","other"]
          }
        }
      }
    }
  }
}

example_schemas.veggie = {
  "description": "Veggie",
  "type": "object",
  "required": [ "veggieName", "veggieLike" ],
  "properties": {
    "veggieName": {
      "type": "string",
      "description": "The name of the vegetable."
    },
    "veggieLike": {
      "type": "boolean",
      "description": "Do I like this vegetable?"
    },
    "score": {
      "type": "number",
      "description": "Rate from 1-10",
      "minimum": 0,
      "maximum": 100,
    },
    "color":{
      "type":"string",
      "enum":["green","red","yellow","other"]
    }
  }
}
