migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("691nrsr5tauqxxv")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "yhisboe4",
    "name": "signature",
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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("691nrsr5tauqxxv")

  // remove
  collection.schema.removeField("yhisboe4")

  return dao.saveCollection(collection)
})
