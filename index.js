require('dotenv').config()
const fs = require('fs');
const express = require('express'); // rquire express
var favicon = require('serve-favicon'); // require serve-favocpm to send the favicon
var path = require('path'); // require path
var cookieParser = require('cookie-parser');
var formidable = require('formidable');
var excel = require('./functionalities/excelparser');
var mongo = require('./functionalities/databaseexport');
const app = express();  // set the app to be express server
const port = process.env.PORT || 9001;  // define port
app.use(favicon(path.join(__dirname,'public','favicon.ico')));  // define favicon
app.use(cookieParser());

let confdatas = fs.readFileSync(path.join(__dirname,'conf.json'))
var config = JSON.parse(confdatas);

var dbhost = config.host || "mongodb://localhost:27017/" 
var databaseendpointname = config.endpoint || "biExports"
var extension = config.extension || "xlsm"
var lstSheetsToScan = config.sheetstoscan || [] 
var lstExportNames = config.exportnames|| []


const authorizedUsers = [{
                            "username":process.env.ADMINUSR,
                            "password": process.env.ADMINPASS
                        }]
//console.log(authorizedUsers)

var authsessions = JSON.parse(fs.readFileSync(path.join(__dirname,'authsessions.json'), 'utf8')) || [];


app.use(express.static(path.join(__dirname, 'views')));

app.use(express.urlencoded({
    extended: true
}))

var watchedFile = path.join(__dirname,'uploads/file.' + extension);
watchChanges(watchedFile);


app.get('/dbHost', (req,res) =>{
    res.json( {"value":dbhost} );
})
app.get('/extension', (req,res) =>{
    res.json( {"value":extension} );
})
app.get('/dbEndpoint', (req,res) =>{
    res.json( {"value":databaseendpointname} );
})
app.get('/lstSheets', (req,res) =>{
    res.json( {"value":lstSheetsToScan} );
})
app.get('/lstNames', (req, res) =>{
    res.json({"value":lstExportNames});
});

app.get('/', (req, res) => {  // get on site root
    //console.log(req.cookies['session']);
    var session = authsessions.find(session => session.id = req.cookies.session)
    if (session != null) {
        res.redirect('config')
    }
    else{
        res.redirect('login')
    }
})
app.route('/login').get((req,res) => {
    res.sendFile('views/login.html', {root: __dirname }) // send the html file
})
.post((req,res) => {
    var usr = authorizedUsers.find(user => user.username === req.body.username)
    if (usr != null) {
        var passw = authorizedUsers.find(user => user.password === req.body.password)
        if (passw != null) {
            session = makeid(12);
            res.cookie("session",session,{ maxAge: 10 * 24 * 60 * 60 * 1000, httpOnly: true })
            authsessions.push({"id": session})
            saveAuthSessions()
            res.redirect('back')
        }
        else{
            res.send("mot de passe incorect")
        }
    }
    else{
        res.send("utilisateur inconnu")
    }
})

app.route('/fileSelect').get((req,res) => {
    var session = authsessions.find(session => session.id === req.cookies.session)

    if (session != null) {
        res.sendFile('views/upload.html', {root: __dirname }) // send the html file
    }
    else{
        res.redirect('login')
    }
    
})
.post((req,res) =>{
   var form = new formidable.IncomingForm();
   form.parse(req, function(err, fields, files){
       var oldPath = files.filetoupload.path;
       var newPath = path.join(__dirname, 'uploads')
               + '/'+"file.xlsm"
       var rawData = fs.readFileSync(oldPath)
     
       fs.writeFile(newPath, rawData, function(err){
           if(err) console.log(err)
           return res.send("Successfully uploaded")
       })
    })
})

app.route('/config').get((req, res) => {
    var session = authsessions.find(session => session.id === req.cookies.session)
    if (session != null) {
        res.sendFile('views/config.html', {root: __dirname }) // send the html file
    }
    else{
        res.redirect('login')
    }

})
.post((req,res) => {
    var session = authsessions.find(session => session.id === req.cookies.session) || authsessions.find(session => session.id === req.body.sessionId)
    if (session != null) {
        /*console.log(req.body.sheetInput)
        console.log(req.body.expNameInput)*/
        if (mongo.testConnection(req.body.databaseUrl ,req.body.databaseEndpointName)) {
            dbhost = req.body.databaseUrl;
            databaseendpointname = req.body.databaseEndpointName;
            console.log(req.body.extension)
            if (req.body.extension == "xlsx" || req.body.extension == "xlsm") {

                fs.unwatchFile(watchedFile)
                console.log(`Stopped watching for changes on ${watchedFile}`);
                extension = req.body.extension
                watchedFile = path.join(__dirname,'uploads/file.' + extension)
                watchChanges(watchedFile)
                lstSheetsToScan = req.body.sheetInput
                lstExportNames = req.body.expNameInput
                var exporConfig = {};
                exporConfig.host = req.body.databaseUrl
                exporConfig.endpoint = req.body.databaseEndpointName
                exporConfig.extension = req.body.extension
                exporConfig.sheetstoscan = req.body.sheetInput
                exporConfig.exportnames = req.body.expNameInput
                var data = JSON.stringify(exporConfig)
                fs.writeFileSync("conf.json",data);
                res.send("Paramètres appliqués avec succès");

            }
            else{
                res.send("L'extensions doit être soit \"xlsx\" soit \"xlsm\"")
            }
        }
        else{
            res.send("il y a eu un problème avec votre requête, paramètres refusés")
        }
    }
    else{
        res.status(401).send();
    }
})

app.listen(port, () => {  // Let the app listen on the defined port for requests
    console.log(`App listening at http://localhost:${port}`)  // log/debug
})

function watchChanges(file) {
    console.log(`Watching for file changes on ${file}`);
    fs.watchFile(file, { interval: 1000 }, (event, filename) => {
        if (fs.existsSync(file)) {
            console.log(`${file} file Changed`);
            var clearprom = clearResultsDirectory();
            clearprom.then( () =>{
                console.log("commencé à lire les datas excel")
                excelprom = excel.parseExcelToJSONdocument(__dirname,file,lstSheetsToScan,lstExportNames)
                excelprom.then( () =>{
                    //console.log("fini de parser")
                    mongo.exportDatas(path.join(__dirname,'results'),dbhost,databaseendpointname)
                })
            })
        }
    });
}

function clearResultsDirectory() {
    var promreturn = new Promise( (resolve,reject) =>{
        fs.readdir(path.join(__dirname, "results"), function (err, files) {
            //handling error
            if (err) {
                reject('Unable to scan directory: ' + err);
            } 
            //listing all files using forEach to delete them 1 by 1
            files.forEach(function (file) {
                fs.unlinkSync(path.join(__dirname, "results/" + file))
            });
            resolve()
            console.log("results is cleared");
        });
    })
    return promreturn
    
}

function makeid(length) {
    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * 
 charactersLength)));
   }
   return result.join('');
}
function saveAuthSessions() {
    fs.writeFile(path.join(__dirname,'authsessions.json'), JSON.stringify(authsessions), function(err){
        if(err) console.log(err);
    })
}