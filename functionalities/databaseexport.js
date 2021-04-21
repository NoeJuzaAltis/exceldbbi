module.exports = {
    exportDatas,
    testConnection
}
var MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
var path = require('path'); // require path
var srcColsToCreate = [];

function exportDatas(folderWithTheFiles,Dbhost,databaseName) {
    var host = Dbhost || "mongodb://localhost:27017/"
    var destinationDb = databaseName || "biExports";
    var url = host + destinationDb;
    
    var readingPromise = new Promise( (resolve, reject) => {
        fs.readdir(folderWithTheFiles, function (err, files) {
            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            } 
            //listing and reading all files using forEach
            files.forEach(function (file) {
                var tab = file.split(".");
                var name = tab[0]
                let rawdatas = fs.readFileSync(path.join(folderWithTheFiles, file))
                var datas = JSON.parse(rawdatas);
                srcColsToCreate.push({
                    "name": name,
                    "datas": datas
                }) // [{name,array},{name,array},{name,array},etc...]
            });
            if (srcColsToCreate != undefined) {
                resolve();
            }
        });
    } )
    
    readingPromise.then( () => {
        MongoClient.connect(url, {useUnifiedTopology: true} ,function(err, db) {
            if (err) throw err;
            //console.log("Database created!");
            var dbo = db.db(destinationDb)
            var lstpromDrop = []
            
            srcColsToCreate.forEach(colToCreate => {
                var name = colToCreate["name"]
                lstpromDrop.push(new Promise( (resolve, reject) => {
                    internalprom = dbo.collection(name).remove({})
                    internalprom.then(() =>{
                        console.log("emptied collection: " + name)
                        resolve();
                    }, () =>
                    {
                        resolve();
                    })
                }))

            });
            Promise.all(lstpromDrop).then(() =>{
                console.log("dropped everything")
                var prom = insert(db,dbo)
                prom.then(() =>{
                    db.close()
                })
            })
        })
    })
}

function insert(db,dbo) {
    var promtoreturn = new Promise( (mainresolve, mainreject) =>{  
        var lstprmInsert = []
        srcColsToCreate.forEach(colToCreate => {
            //console.log(colToCreate)
            console.log(colToCreate)
            var name = colToCreate["name"]
            var datas = colToCreate["datas"]

            /*{"datas" : 
            {
                "Non défini": 12,
                "Hors délai": 10,
                "Tendu" : 16,
                "Tenu" : 15,
            } }*/
            
            lstprmInsert.push(new Promise((resolve, reject) =>{
                dbo.collection(name).insertOne(datas, function(err, res) {
                    if (err) throw err;
                    console.log("Number of documents inserted: " + res.insertedCount); 
                    resolve()
                },() =>{
                    reject()
                });
            }))
            
        });
            Promise.all(lstprmInsert).then(() => {
                console.log("tout inséré")
                mainresolve();
            }, () =>{
                mainreject();
            })
    } )
    return promtoreturn
}

function testConnection(Dbhost,databaseName) {
    var host = Dbhost;
    var destinationDb = databaseName;
    var url = host + destinationDb;
    MongoClient.connect(url, function(err, db) {
        if (err){
            return false;
            throw err;
        }
        console.log("Connexion fonctionelle !");
        db.close();
    });
    return true
}