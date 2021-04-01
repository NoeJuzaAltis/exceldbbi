const fs = require('fs');
const express = require('express'); // rquire express
var favicon = require('serve-favicon'); // require serve-favocpm to send the favicon
var path = require('path'); // require path
var formidable = require('formidable');
const app = express();  // set the app to be express server
const port = process.env.PORT || 9001;  // define port
app.use(favicon(path.join(__dirname,'public','favicon.ico')));  // define favicon

app.use(express.static(path.join(__dirname, 'views')));

app.use(express.urlencoded({
    extended: true
}))

var watchedFile = 'uploads/file.xlsx';
watchChanges(watchedFile);


app.get('/', (req, res) => {  // get on site root
    res.sendFile('views/upload.html', {root: __dirname }) // send the html file
    /*fs.unwatchFile(watchedFile)
    console.log(`Stopped watching for changes on ${watchedFile}`);
    watchedFile = '../newfile.txt'
    watchChanges(watchedFile)*/
})
app.route('/fileSelect')
    .get((req,res) => {
        res.sendFile('views/upload.html', {root: __dirname }) // send the html file
    })
    .post((req,res) =>{
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files){
            var oldPath = files.filetoupload.path;
            var newPath = path.join(__dirname, 'uploads')
                    + '/'+"file.xlsx"
            var rawData = fs.readFileSync(oldPath)
          
            fs.writeFile(newPath, rawData, function(err){
                if(err) console.log(err)
                return res.send("Successfully uploaded")
            })
      })
    })

app.listen(port, () => {  // Let the app listen on the defined port for requests
    console.log(`App listening at http://localhost:${port}`)  // log/debug
})

function watchChanges(file) {
    console.log(`Watching for file changes on ${watchedFile}`);
    fs.watchFile(file, { interval: 1000 }, (event, filename) => {
        console.log(`${file} file Changed`);
    });
}