migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("691nrsr5tauqxxv")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wp1mcxwp",
    "name": "phone",
    "type": "text",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "h7kfsjcc",
    "name": "image",
    "type": "file",
    "required": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "maxSize": 5242880,
      "mimeTypes": [
        "image/jpeg",
        "image/png",
        "image/svg+xml",
        "image/gif",
        "image/webp"
      ],
      "thumbs": []
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "8j0htd8d",
    "name": "marital",
    "type": "text",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("691nrsr5tauqxxv")

  // remove
  collection.schema.removeField("wp1mcxwp")

  // remove
  collection.schema.removeField("h7kfsjcc")

  // remove
  collection.schema.removeField("8j0htd8d")

  return dao.saveCollection(collection)
})
