fetch('extension', {method:'GET'}).then(function(response) {
    response.json().then((rep) =>{
        document.getElementById("fileup").setAttribute("accept", "." + rep["value"])
    })
})
$("#submit-btn").click(function(){

$("#pageloader").show();

});