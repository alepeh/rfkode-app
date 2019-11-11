import RelationshipResolver  from '../../../src/components/db/relationship-resolver.js';

it('level 1 relationship references are replaced with the full object', () => {
    return new RelationshipResolver(new MockDatabase()).expandRelations(rootDoc)
        .then(expandedObject => {
            expect(expandedObject['rel1']).toBe(rel1Doc);
        });    
});

it('level 2 relationship references are replaced with the full object', () => {
    return new RelationshipResolver(new MockDatabase()).expandRelations(rootDoc)
        .then(expandedObject => {
            expect(expandedObject['rel1']['rel2']).toBe(rel2Doc);
        });    
});

class MockDatabase {
    getDocument(id, options){
        let doc;
        if( id === rootDoc._id) doc = rootDoc;
        if( id === rootSchemaDoc._id) doc = rootSchemaDoc;
        if( id === rel1Doc._id) doc = rel1Doc;
        if( id === rel1SchemaDoc._id) doc = rel1SchemaDoc;
        if( id === rel2Doc._id) doc = rel2Doc;
        return  Promise.resolve(doc);
    }
}

const rootDoc = {
    _id: "record:root:v1:xxx",
    schemaDocId: "schema:root:v1",
    rel1: "record:rel1:v1:xxx"
};

const rootSchemaDoc = {
    _id: "schema:root:v1",
    "jsonSchema": {
        "properties": {
            "rel1": {
                "type": "string",
                "format": "relationship"
            },
        },
        "relationships": {
            "rel1": {
                "$ref": "schema:rel1:v1"
            }
        }
    }
}

const rel1Doc = {
    _id: "record:rel1:v1:xxx",
    schemaDocId: "schema:rel1:v1",
    name: "Level1",
    rel2: "record:rel2:v1:xxx"
}

const rel1SchemaDoc = {
    _id: "schema:rel1:v1",
    "jsonSchema": {
        "properties": {
            "rel2": {
                "type": "string",
                "format": "relationship"
            }
        },
        "relationships": {
            "rel2": {
                "$ref": "schema:rel2:v1"
            }
        }
    }
}

const rel2Doc = {
    _id: "record:rel2:v1:xxx",
    schemaDocId: "schema:rel2:v1",
    name: "Level2"
}