/*------------------------------------------------------------------------------------------------------
    Excel DB BI 
    Takes data from specific excel sheet on a .xlsx or .xlsm document
    Then exports them to a mongodb for later use (Power BI import after that)
    index.js : Backend with main logic
------------------------------------------------------------------------------------------------------*/
// Requires and modules implementations
require('dotenv').config()  // .env to get environement variables
const fs = require('fs');   // Interacting with filesystem
const express = require('express'); // require express
var favicon = require('serve-favicon'); // require serve-favocpm to send the favicon
var path = require('path'); // require path
var cookieParser = require('cookie-parser');    // parse users' cookies
var formidable = require('formidable'); // extract files from forms
var excel = require('./functionalities/excelparser');   // homemade module to parse defined sheets from an excel document
var mongo = require('./functionalities/databaseexport');// homemade module to export json data to mongodb
const app = express();  // set the app to be express server
const port = process.env.PORT || 9001;  // define port
app.use(favicon(path.join(__dirname,'public','favicon.ico')));  // define favicon
app.use(cookieParser());
//------------------------------------------------------------------------------------------------------
//Init
let confdatas = fs.readFileSync(path.join(__dirname,'conf.json'))   // get pre-defined/saved configuration
var config = JSON.parse(confdatas); // parse as a JSON object

var dbhost = config.host || "mongodb://localhost:27017/"    // setup the db host
var databaseendpointname = config.endpoint || "biExports"   // the endpoint (name of exported database)
var extension = config.extension || "xlsm"                  // excel file extension
var lstSheetsToScan = config.sheetstoscan || []             // Array with the names of the export sheets
var lstExportNames = config.exportnames|| []                // Array with the "export" names (in the database)


const authorizedUsers = [{
                            "username":process.env.ADMINUSR,
                            "password": process.env.ADMINPASS
                        }]  // array to permit admin authentication
                            // IMPORTANT NOTE: you can add more authentified users if you want to but
                            // if you want to have different auth levels you're going to need to implement it yourself,
                            // as it is not yes a feature of this program
//console.log(authorizedUsers) // debug

var authsessions = JSON.parse(fs.readFileSync(path.join(__dirname,'authsessions.json'), 'utf8')) || []; // get saved/preconfigured valid session ids
                                                                                                        // so the user doesn't has to reconnect everytime

app.use(express.static(path.join(__dirname, 'views'))); // use the view directory

app.use(express.urlencoded({
    extended: true
})) // Encoded urls (else there is a problem with the file upload)

var watchedFile = path.join(__dirname,'uploads/file.' + extension); // File that is going to be looked at for changes
watchChanges(watchedFile);  // watch the file for changes

app.listen(port, () => {  // Let the app listen on the defined port for requests
    console.log(`App listening at http://localhost:${port}`)  // log/debug
})
//------------------------------------------------------------------------------------------------------
// "API" to access some backend data from frontend (mostly for the config page)
app.get('/dbHost', (req,res) =>{    // sends the database host/url
    checkforApiAccess(req,res,dbhost);
})
app.get('/extension', (req,res) =>{ // sends the extension of the file
    checkforApiAccess(req,res,extension);
})
app.get('/dbEndpoint', (req,res) =>{// sends the database endpoint
    checkforApiAccess(req,res,databaseendpointname);
})
app.get('/lstSheets', (req,res) =>{ // sends the array of sheets to read 
    checkforApiAccess(req,res,lstSheetsToScan);
})
app.get('/lstNames', (req, res) =>{ // sends the array of export names
    checkforApiAccess(req,res,lstExportNames);
});
/**
 * Checks if the session is authenticated and returns the good results if so
 * @param {*} req request
 * @param {*} res result
 * @param {*} dataforauthenticated data that will be sent to result if auth
 */
function checkforApiAccess(req,res,dataforauthenticated) {
    var session = authsessions.find(session => session.id === req.cookies.session)  // checks if the user is authentified
    if (session != null) {  // user is authentified
        res.json( {"value":dataforauthenticated} );
    }
    else{
        res.status(401).send("Unauthorized")
    }
}
//------------------------------------------------------------------------------------------------------
// Routes
app.get('/', (req, res) => {  // get on site root
    //console.log(req.cookies['session']);  // debug
    var session = authsessions.find(session => session.id = req.cookies.session)// tries to find a corressponding session in the user's cookies
    if (session != null) {  // if the session is valid
        res.redirect('config')  // redirect to http://name:port/config
    }
    else{
        res.redirect('login')   // redirect to http://name:port/login for the user to authenticate
    }
})
app.route('/login').get((req,res) => {  // when the user tries to "get" the login page
    res.sendFile('views/login.html', {root: __dirname }) // send the html login file
})
.post((req,res) => {    // when the user sends back the form
    var usr = authorizedUsers.find(user => user.username === req.body.username && user.password === req.body.password) // checks if the informations specified by the user correspond to a defined user+pass combo
    if (usr != null) {  // if the user is ok (user+pass is known)
            session = makeid(12);   // create a sessionid
            res.cookie("session",session,{ maxAge: 10 * 24 * 60 * 60 * 1000, httpOnly: true })  // sends the cookie to the user
            authsessions.push({"id": session})  // add the new session ID to the list
            saveAuthSessions()  // save authentified sessions inside authsessions.json
            res.redirect('config')  // redirect the user to http://name:port/config
    }
    else{
        res.status(401).send("utilisateur inconnu <br/> <a href=\"login\">Retour à la page de login</a>") // notifies the user that the auth didn't work
    }
})

app.route('/fileSelect').get((req,res) => { // when the user tries to get the fileselect page 
    var session = authsessions.find(session => session.id === req.cookies.session)  // checks if the user is authentified

    if (session != null) {  // user is authentified
        res.sendFile('views/upload.html', {root: __dirname }) // send the upload html file
    }
    else{
        res.redirect('login')   // redirect the user to the login page
    }
    
})
.post((req,res) =>{ // when the user has posted the form
   var form = new formidable.IncomingForm();    // new form 
   form.parse(req, function(err, fields, files){    // parse the form
       var oldPath = files.filetoupload.path;   // the old path of the file
       var newPath = path.join(__dirname, 'uploads')    // the new path of the file
               + '/'+"file.xlsm"
       var rawData = fs.readFileSync(oldPath)   // read the file to extract the raw data
     
       fs.writeFile(newPath, rawData, function(err){    // write the new file in the local filesystem
           if(err) {console.log(err);return res.send("something went wrong during the upload <br/><pre>" + err + "</pre>")} // send the error in the console & to user if something goes wrong
           return res.send("Successfully uploaded") // send to the user that his upload was successfull
       })
    })
})

app.route('/config').get((req, res) => {    // when the user tries to get the config route
    var session = authsessions.find(session => session.id === req.cookies.session)  // checks if the session is authentified
    if (session != null) { // Authentified session
        res.sendFile('views/config.html', {root: __dirname }) // send the html config file
    }
    else{
        res.redirect('login')   // redirect user to login page
    }

})
.post((req,res) => {    // when the form is posted
    var session = authsessions.find(session => session.id === req.cookies.session) || authsessions.find(session => session.id === req.body.sessionId)   // if the session is authentified
    if (session != null) {
        /*console.log(req.body.sheetInput) // debug
        console.log(req.body.expNameInput) // debug */
        var ok = mongo.testConnection(req.body.databaseUrl, req.body.databaseEndpointName)
        ok.then((okval) =>{
            if (okval) { // tests if the mongo connection is good with the informations passed by the user
                dbhost = req.body.databaseUrl;  // sets database host as what is passed by the user
                databaseendpointname = req.body.databaseEndpointName;   // Sets endpoint as what is defined by user
                //console.log(req.body.extension) // debug
                if (req.body.extension == "xlsx" || req.body.extension == "xlsm") { // if the extension is xlsx or xlsm
                    fs.unwatchFile(watchedFile)  // stop watching for changes on old file
                    console.log(`Stopped watching for changes on ${watchedFile}`); // log that the server stopped to look for change on the old file
                    extension = req.body.extension  // sets the new extension as what is defined by the user
                    watchedFile = path.join(__dirname,'uploads/file.' + extension)  // sets the new watched file with the new extension
                    watchChanges(watchedFile)   // watch for changes on the new file
                    lstSheetsToScan = req.body.sheetInput   // set the variable as the user defined value
                    lstExportNames = req.body.expNameInput  // same
                    var exporConfig = {};   // create a new empty Javascript Object
                    exporConfig.host = req.body.databaseUrl // sets the new config property as what the user defined
                    exporConfig.endpoint = req.body.databaseEndpointName //same
                    exporConfig.extension = req.body.extension//same
                    exporConfig.sheetstoscan = req.body.sheetInput//same
                    exporConfig.exportnames = req.body.expNameInput//same
                    var data = JSON.stringify(exporConfig)//stringify the object to insert it in a file
                    fs.writeFileSync("conf.json",data);// write the new config inside conf.json
                    res.send("Paramètres appliqués avec succès");   // notify the user that the parameters are 👌
    
                }
                else{   // extension problem
                    res.send("L'extensions doit être soit \"xlsx\" soit \"xlsm\"")
                }
            }
            else{ // Mongodb connexion problem
                res.send("il y a eu un problème avec votre requête, paramètres refusés")
            }
        })
    }
    else{// unauthentified session
        res.status(401).send("unauthorised");
    }
})
//------------------------------------------------------------------------------------------------------
//Functions
function watchChanges(file) {   // watch for changes on a file
    console.log(`Watching for file changes on ${file}`); // log the filewatch
    fs.watchFile(file, { interval: 1000 }, (event, filename) => {   // when the file changed/created/deleted
        if (fs.existsSync(file)) {  // if the file exists
            console.log(`${file} file Changed`); //log file change
            var clearprom = clearResultsDirectory(); // retrieve the promise to clear the ./results/ folder
            clearprom.then( () =>{  //when the result folder is empty
                console.log("commencé à lire les datas excel")  // log the start of excel parsong
                excelprom = excel.parseExcelToJSONdocument(__dirname,file,lstSheetsToScan,lstExportNames)   // retrieve promise to parse the excel document
                excelprom.then( () =>{ // when the excel document is fully parsed & the .json files are created
                    //console.log("fini de parser")
                    mongo.exportDatas(path.join(__dirname,'results'),dbhost,databaseendpointname)   // export the json datas inside ./json to the mongodb
                })
            })
        }
    });
}

function clearResultsDirectory() {  //Clear the ./results folder, returns the promise to do so for sync behaviour
    var promreturn = new Promise( (resolve,reject) =>{  // the promise to return
        fs.readdir(path.join(__dirname, "results"), function (err, files) { // read the folder
            //handling error
            if (err) {
                reject('Unable to scan directory: ' + err); // reject the promise with coresponding error code
            } 
            //listing all files using forEach to delete them 1 by 1
            files.forEach(function (file) { // foreach file inside the folder
                fs.unlinkSync(path.join(__dirname, "results/" + file))  // delete the files synchronously
            });
            resolve() // resolve the promise 
            console.log("results is cleared"); // log that the forlder has been cleared
        });
    })
    return promreturn // return the promise
    
}

function makeid(length) {   // make an ID of a defined size
    var result           = [];  // empry array
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#';  // set of characters to pick from to make an ID
    var charactersLength = characters.length;   // length of the set of characters
    for ( var i = 0; i < length; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * charactersLength))); // add some characters for every loop inside the array
   }
   return result.join('');// return a string that is the concatanation of all the random picked chars
}

function saveAuthSessions() {   // Save the authentified sessions inside the authsessions.json file
    fs.writeFile(path.join(__dirname,'authsessions.json'), JSON.stringify(authsessions), function(err){
        if(err) console.log(err);
    })
}
//------------------------------------------------------------------------------------------------------