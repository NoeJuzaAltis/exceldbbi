module.exports = {
    parseExcelToJSONdocument
}
const readXlsxFile = require('read-excel-file/node');
var path = require('path'); // require path
const fs = require('fs');

function parseExcelToJSONdocument(rootdir,file,lstsheetstoRead,lstnamestoExport){
    var promiseToReturn = new Promise((mainresolve,mainreject) =>{
        var object = {};
        var lstPromises = [];
        var promise;
        promise = new Promise((resolve, reject) => {
            readXlsxFile(file, { getSheets: true }).then((sheets) => {
                // sheets === [{ name: 'Sheet1' }, { name: 'Sheet2' }]
                sheets.forEach( (feuil, index) => {
                    var indexName = lstsheetstoRead.findIndex(fl=> fl === feuil.name)
                    if (indexName != "-1") {
                        //console.log(feuil.name +" = " + lstsheetstoRead[indexName])
                        lstPromises.push(readLaSheetExcel(file,feuil.name, lstnamestoExport[indexName]));
                    }
                    if (index === sheets.length -1)
                    { 
                        resolve();
                    }
                })
            })
        })
        promise.then(() =>{
            Promise.all(lstPromises).then( (results) =>{
                results.forEach( (result,index) => {
                    var tempobject = result["datas"]
                    fs.writeFileSync(rootdir + '/results/' + result["title"] + '.json', JSON.stringify(tempobject))
                    //console.log("outputed " + result["title"] + '.json')
                    mainresolve();
                })
            })
        })
    });
    return promiseToReturn;
}

function readLaSheetExcel(file, sheetname, title){
    var returnObject = [];
    var datas = []
    var promiseint = new Promise((resolve,reject) => {
        readXlsxFile(file,{sheet : sheetname }).then((rows) => {
            rows.forEach( (row,index) => {
                var JsonInterne = {};
                //console.log(row)
                //console.log(index)
                if (index != 0) {
                    for (let i0 = 0; i0 < row.length; i0++) {
                        var name = rows[0][i0]
                        JsonInterne[name] = row[i0]
                    }
                    datas.push(JsonInterne)
                }
            });
            //console.log(datas);
            if (returnObject != {}) {
                returnObject["datas"] = datas;
                returnObject["title"] = title;
                resolve(returnObject);
            }
            else{
                reject("Couldn't resolve the reading promise")
            }
        })
    })
    return promiseint
}