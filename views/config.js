fetch('dbHost', {method:'GET'}).then(function(response) {
    response.json().then((rep) =>{
        document.getElementById("inpdburl").placeholder = rep["value"];    
    })
})
fetch('dbEndpoint', {method:'GET'}).then(function(response) {
    response.json().then((rep) =>{
        document.getElementById("inpcolname").placeholder = rep["value"];    
    })
})
fetch('extension', {method:'GET'}).then(function(response) {
    response.json().then((rep) =>{
        document.getElementById("ext").placeholder = rep["value"];    
    })
})
fetch('lstSheets', {method:'GET'}).then(function(repsheets) {
    repsheets.json().then((repsheetsjson) =>{
        var container = document.getElementById("container"); 
        
        var lst = repsheetsjson.value;
        //console.log(lst)
        lst.forEach( (pagetitle ,index) => {
            var tr = document.createElement('tr');
            var tdSheet = document.createElement('td');
            tdSheet.setAttribute("class","sheetinput")
            var inpSheet = document.createElement('input');
            var tdName = document.createElement('td');
            var inpName = document.createElement('input')
            var btnDell = document.createElement('input')
            var btnAsIs = document.createElement('input')
            btnAsIs.setAttribute("type","button")
            btnAsIs.setAttribute("value","As Is")
            btnDell.setAttribute("type","button")
            btnDell.setAttribute("value","Suppr.")
            inpSheet.setAttribute("type","text")
            inpSheet.setAttribute("placeholder",pagetitle)
            inpSheet.setAttribute("required","true")
            inpSheet.setAttribute("name","sheetInput[" + index +  "]")
            
            fetch('lstNames', {method:'GET'}).then(function(repnames) {
                repnames.json().then((repnamesjson) =>{
                    var lstnames = repnamesjson.value
                    var expname = lstnames[index]
                    inpName.setAttribute("type","text")
                    inpName.setAttribute("placeholder",expname)
                    inpName.setAttribute("required","true")
                    inpName.setAttribute("name","expNameInput[" + index +  "]")
                })
            })
            tdName.appendChild(inpName)
            tdName.appendChild(btnDell)
            tdName.appendChild(btnAsIs)
            tdSheet.append(inpSheet)

            tr.append(tdSheet)
            tr.append(tdName)
            container.append(tr)
            btnDell.setAttribute("onClick","delRow(" + tr.rowIndex + ")")
            btnAsIs.setAttribute("onClick","asIs(" + tr.rowIndex + ")")
        }); 
        container.appendChild
    })
})
function delRow(rowToDelete) {
    var delcontainer = document.getElementById("container"); 
    //console.log(rowToDelete)
    delcontainer.removeChild(delcontainer.children[rowToDelete]);
    resetRow();
}
function addRow() {
    var add = document.getElementById("container"); 
    var tr = document.createElement('tr');
    var tdSheet = document.createElement('td');
    tdSheet.setAttribute("class","sheetinput")
    var inpSheet = document.createElement('input');
    var tdName = document.createElement('td');
    var inpName = document.createElement('input')
    var btnDell = document.createElement('input')
    var btnAsIs = document.createElement('input')
    btnAsIs.setAttribute("type","button")
    btnAsIs.setAttribute("value","As Is")

    btnDell.setAttribute("type","button")
    btnDell.setAttribute("value","Suppr.")
    inpSheet.setAttribute("type","text")
    inpSheet.setAttribute("placeholder","Nom de la feuille excel")
    inpSheet.setAttribute("required","true")
    inpName.setAttribute("type","text")
    inpName.setAttribute("placeholder","Nom de l'export dans la bdd")
    inpName.setAttribute("required","true")
    container.append(tr)
    inpName.setAttribute("name","expNameInput[" + tr.rowIndex +  "]")
    inpSheet.setAttribute("name","sheetInput[" + tr.rowIndex +  "]")
    tdName.appendChild(inpName)
    tdName.appendChild(btnDell)
    tdName.appendChild(btnAsIs)
    tdSheet.append(inpSheet)
    tr.append(tdSheet)
    tr.append(tdName)
    resetRow()
}
function asIs(index) {
    var delcontainer = document.getElementById("container"); 
    var nameplaceholder = delcontainer.children[index].children[1].children[0].placeholder
    var sheetplaceholder = delcontainer.children[index].children[0].children[0].placeholder
    delcontainer.children[index].children[1].children[0].setAttribute("value",nameplaceholder)
    delcontainer.children[index].children[0].children[0].setAttribute("value",sheetplaceholder)
}
function resetRow() {
    var delcontainer = document.getElementById("container"); 
    var lstchilds = Array.from(delcontainer.children)

    lstchilds.forEach( (element,index) => {
        if (index >= 5) {
            delcontainer.children[index].children[1].children[1].setAttribute("onClick","delRow(" + index + ")")
            delcontainer.children[index].children[1].children[2].setAttribute("onClick","asIs(" + index + ")")
            delcontainer.children[index].children[1].children[0].setAttribute("name","expNameInput[" + index + "]")
            delcontainer.children[index].children[0].children[0].setAttribute("name","sheetInput[" + index + "]")
        }
    });
}