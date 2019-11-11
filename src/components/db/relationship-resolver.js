export default class RelationshipResolver {

    constructor(database){
        this.database = database;
    }

    expandRelations(document){
        console.log(document)
        let promises = [];
        promises.push(this.database.getDocument(document.schemaDocId).then(schema => {
            Object.keys(schema.jsonSchema.relationships).map((relationship) => {
                promises.push(this.database.getDocument(document[relationship]).then((relatedRecord) => {
                    promises.push(this.expandNestedRelations(relatedRecord).then(expandedRecord => {
                        console.log(expandedRecord);
                        document[relationship] = expandedRecord;
                    })
                )
                })
                )
            });
        }));
        return Promise.all(promises).then(() => {
            console.log(document);
            return document});
    }

    expandNestedRelations(relatedRecord){
        let nestedPromises = [];
        this.database.getDocument(relatedRecord.schemaDocId).then(nestedSchema => {
            Object.keys(nestedSchema.jsonSchema.relationships).map((nestedRelationship) => {
                console.log(nestedRelationship);
                nestedPromises.push(this.database.getDocument(relatedRecord[nestedRelationship]).then((nestedRelatedRecord) => {
                    console.log(nestedRelatedRecord);
                    relatedRecord[nestedRelationship] = nestedRelatedRecord;
                }));
            });
        });
        return Promise.all(nestedPromises).then(() => {
            console.log(relatedRecord);
            return relatedRecord});
    }
}