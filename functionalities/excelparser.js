/*------------------------------------------------------------------------------------------------------
    Excel DB BI 
    excelparser.js : homemade js module that is used to parse datas from specified sheets in a specified excel document
------------------------------------------------------------------------------------------------------*/
module.exports = {
    parseExcelToJSONdocument
}   // exported functions
const readXlsxFile = require('read-excel-file/node');   // require the module that will read the excel file data
var path = require('path'); // require path
const fs = require('fs');   // filesystem interactions

function parseExcelToJSONdocument(rootdir,file,lstsheetstoRead,lstnamestoExport){   // main function that is going to create all the .json files returns the promise to do so
    var promiseToReturn = new Promise((mainresolve,mainreject) =>{  // the promise that is going to be returned
        var lstPromises = [];   // array of promises used to know when all excel sheets are read
        var promise;    // the main promise
        promise = new Promise((resolve, reject) => {    // create the main promise
            readXlsxFile(file, { getSheets: true }).then((sheets) => {  // read the excel file
                // sheets === [{ name: 'Sheet1' }, { name: 'Sheet2' }]
                sheets.forEach( (feuil, index) => { // foreach sheet inside the document
                    var indexName = lstsheetstoRead.findIndex(fl=> fl === feuil.name)   // check if the actual sheet is one of the defined sheets to parse
                    if (indexName != "-1") {    // if the actual shit is one of the defined sheets to parse
                        //console.log(feuil.name +" = " + lstsheetstoRead[indexName]) // debug
                        lstPromises.push(readLaSheetExcel(file,feuil.name, lstnamestoExport[indexName])); // add a new promise to the list of promise to parse the excel sheets
                    }
                    if (index === sheets.length -1) // if the actual sheet is the last sheet (foreach ended)
                    { 
                        resolve(); // resolve the internal promise
                    }
                })
            })
        })
        promise.then(() =>{ // when the main proimise is resolved
            Promise.all(lstPromises).then( (results) =>{    // When all the reading promises resolved
                results.forEach( (result,index) => {    // foreach promise result
                    var tempobject = result["datas"]    // create a temporary object that is the property "datas" of the JSO
                    fs.writeFileSync(rootdir + '/results/' + result["title"] + '.json', JSON.stringify(tempobject)) // write the corresponding file inside /results/ folder
                    //console.log("outputed " + result["title"] + '.json')
                    mainresolve();  // resolve the main promise that will be returned
                })
            })
        })
    });
    return promiseToReturn; // return the main promise 
}

function readLaSheetExcel(file, sheetname, title){  // read and parse the datas of a specific sheet inside an excel file, returns the promise to do so
    var returnObject = [];  // array that will be returned
    var datas = []  // "datas" property of the onject inside the array that will be returned
    var promiseint = new Promise((resolve,reject) => {  // main promise that will be returned
        readXlsxFile(file,{sheet : sheetname }).then((rows) => {   // read the specified sheet
            rows.forEach( (row,index) => {  // foreach row in the sheet
                var JsonInterne = {};   // create a jso that will contain the name of the export and the datas
                //console.log(row)
                //console.log(index)
                if (index != 0) {   // if it isn't the first row (whiche cointains the "titles")
                    for (let i0 = 0; i0 < row.length; i0++) {
                        var name = rows[0][i0]  // get the title from the current position
                        JsonInterne[name] = row[i0] // get the value of the current position
                    }
                    datas.push(JsonInterne) // add the jso to the array
                }
            });
            //console.log(datas);
            if (returnObject != {}) {   // if the return object is not an object
                returnObject["datas"] = datas;  // set datas property as the "datas" array
                returnObject["title"] = title;  // set the title as the title
                resolve(returnObject);  // resolve the promise with the array to return
            }
            else{
                reject("Couldn't resolve the reading promise") // reject the promise as the reading didn't work as expected
            }
        })
    })
    return promiseint // return the promise to read
}