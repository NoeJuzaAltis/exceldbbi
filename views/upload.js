let dropAera = document.getElementById("drop-aera")

;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropAera.addEventListener(eventName, preventDefaults, false)
})
function preventDefaults (e) {
    e.preventDefault()
    e.stopPropagation()
}
dropAera.addEventListener('drop', handleDrop, false)

function handleDrop(e) {
    let dt = e.dataTransfer
    let files = dt.files
    if (files.length == 1) {
        //console.log(files)
        var name = String(files[0].name)
        //console.log(typeof name)
        //console.log(typeof name)
        var ext = name.split(".")
        //console.log("." + ext[ext.length -1])
        console.log(document.getElementById("fileup").getAttribute("accept"))   
        if ("." + ext[ext.length -1] === document.getElementById("fileup").getAttribute("accept")) {
          console.log("same ext")
          handleFiles(files)
        }
        else{
          unhandleFile()
        }
    }
    else{
        unhandleFile()
    }
  
  
}

fetch('extension', {method:'GET'}).then(function(response) {
    response.json().then((rep) =>{
        document.getElementById("fileup").setAttribute("accept", "." + rep["value"])
    })
})
function showLoading() {
    document.getElementById("pageloader").setAttribute("class", "visible")
}
$("#submit-btn").click(function(){
    $("#pageloader").show();
});

function handleFiles(files) {
    if (files.length == 1) {
        var file = files[0]
        if (file) {
            document.getElementById("fileup").files = files
            document.getElementById("drop-aera").setAttribute("class","drop-aera dropped")
        }
    }
}
function unhandleFile() {
    document.getElementById("drop-aera").setAttribute("class","drop-aera placeholder")
    var b = new ClipboardEvent("").clipboardData || new DataTransfer()
    document.getElementById("fileup").files = b.files
}