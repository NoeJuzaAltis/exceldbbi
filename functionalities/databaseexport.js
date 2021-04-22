/*------------------------------------------------------------------------------------------------------
    Excel DB BI 
    databaseexport.js : homemade js module that is used to export the datas inside the mongodb
------------------------------------------------------------------------------------------------------*/
module.exports = {
    exportDatas,
    testConnection
}   // exported funcitons
var MongoClient = require('mongodb').MongoClient;   // mongo connection
const fs = require('fs');   // filesystem
var path = require('path'); // require path
var srcColsToCreate = [];   // columns to create

function exportDatas(folderWithTheFiles,Dbhost,databaseName) {  // main function, export the json datas to a mongodb database
    var host = Dbhost || "mongodb://localhost:27017/"   // database host
    var destinationDb = databaseName || "biExports";    // database endpoint
    var url = host + destinationDb;                     // full database url
    
    var readingPromise = new Promise( (resolve, reject) => {    // promise to read the .json files inside ./results
        fs.readdir(folderWithTheFiles, function (err, files) {  // read the folder
            //handling error
            if (err) {
                reject("Unable to scan the directory: " + err); // reject the promise with the coressponding error
            } 
            
            files.forEach(function (file) { // for each file in the folder
                var tab = file.split(".");  // split the name of the file on the "."
                var name = tab[0]   // the export name is the first part of the name of the file
                let rawdatas = fs.readFileSync(path.join(folderWithTheFiles, file)) // retrieve what is written in the .json file
                var datas = JSON.parse(rawdatas);   // parse the text as a Javascript Object
                srcColsToCreate.push({ 
                    "name": name,
                    "datas": datas
                }) // add an element to the array like : [{name,array},{name,array},{name,array},etc...]
            });
            if (srcColsToCreate != undefined) { // if the cols are created
                resolve(); // resolve
            }
        });
    } )
    
    readingPromise.then( () => {    // when the reading promise resolves
        MongoClient.connect(url, {useUnifiedTopology: true} ,function(err, db) {    //connect to the database
            if (err) throw err; // error handle
            //console.log("Database created!");
            var dbo = db.db(destinationDb)  // retrieve the database with the endpoint
            var lstpromDrop = []    // array that will contain the dropping promises
            
            srcColsToCreate.forEach(colToCreate => {    // foreach col(lection) to create
                var name = colToCreate["name"]  // retrieve the col name
                lstpromDrop.push(new Promise( (resolve, reject) => { // add the promise to drop the collection to the array
                    internalprom = dbo.collection(name).deleteOne({})  // internal promise that will drop the collection
                    internalprom.then(() =>{    // when the collection is dropped
                        console.log("emptied collection: " + name) // log the empting
                        resolve();  // resolve the promise
                    }, () =>
                    {// if promise is not resolved (example: collection does not exists)
                        resolve(); // resolve the promise
                    })
                }))

            });
            Promise.all(lstpromDrop).then(() =>{    // when all the dropping promises are resolved
                console.log("dropped everything")   // log the dropping
                var prom = insert(db,dbo)   // promise to insert the datas in the database
                prom.then(() =>{    // when everything is inserted into the database
                    db.close()  // close the database connection
                })
            })
        })
    })
}

function insert(db,dbo) {   // insert datas into the database, return the promise to do so
    var promtoreturn = new Promise( (mainresolve, mainreject) =>{   // promise to return
        var lstprmInsert = []   // list of internal promises that is used to know when everything is inserted
        srcColsToCreate.forEach(colToCreate => { // for each col(lection) to create
            //console.log(colToCreate) // debug
            var name = colToCreate["name"]  // retieve the name of the collection
            var datas = colToCreate["datas"]    // retrieve the datas inside
            /* example;
            {
                "name" : "taskStatus"
                "datas" : 
                [{
                    "Non défini": 12,
                    "Hors délai": 10,
                    "Tendu" : 16,
                    "Tenu" : 15,
                }, etc...]
            }
            use of the array as datas for multiple "rows" export*/
            
            lstprmInsert.push(new Promise((resolve, reject) =>{ // add a new promise to the array
                dbo.collection(name).insertMany(datas, function(err, res) { /*  insert all the datas inside the collection with the name 
                                                                                (if the collection doesn't exist it will be created at the same time) */
                    if (err) throw err; // error handling
                    console.log("Number of documents inserted: " + res.insertedCount);  // log the number of document that has been inserted in the collection
                    resolve()   // resolve the promise 
                },() =>{
                    reject("Insert into collection " + name + " failed") // reject the promise on insert fail
                });
            }))
            
        });
            Promise.all(lstprmInsert).then(() => {  //when all the inserting promises have ended
                console.log("tout inséré")  // log that the job has ended
                mainresolve();  // resolve the main promise that will be returned
            }, () =>{
                mainreject();   // reject the main promise on any insert fail
            })
    } )
    return promtoreturn //return the main promise
}

function testConnection(Dbhost,databaseName) {  // used to test conneciton to a database
    var host = Dbhost;                  //same as in the main function
    var destinationDb = databaseName;   //same
    var url = host + destinationDb;     //same
    MongoClient.connect(url, function(err, db) {    // try to connect to the client
        if (err){
            return false;   //return false if there is an error
        }
        console.log("Connexion fonctionelle !");    // log functionning connection 
        db.close(); // close database connection
        return true // return true to say that the database connection is working
    });
    
}