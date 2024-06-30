import { Calendar } from "./Calendar.js";


class exportpdf extends Calendar{

    clickSlot(hour, dayIndex) {
        if (this.mode == MODE.VIEW) return false;
    }
    
    openModal(event) {
        return false;
    }

}

let expo = new exportpdf();
expo.setup();


var today = new Date();
var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();

document.getElementById('date').textContent = date;

let localStoreLegende = localStorage.getItem('legende');

if (localStoreLegende) {
    let legendeArray = JSON.parse(localStoreLegende);
    let legendeHtml = "";

    for (let i = 0; i < legendeArray.length; i++) {
        if (i === 3) {
            legendeHtml += "<br>"; // Add line break after the third legende
        }
        legendeHtml += legendeArray[i] + "<span style='color: #6d005e;'> | </span>"
    }

    legendeHtml = legendeHtml.slice(0, -2); // Remove the last comma and space

    document.getElementById('legende').innerHTML = legendeHtml;
} else {
    document.getElementById('legende').innerHTML = "No data found";
}


const hinweisCopy = localStorage.getItem('hinweis');
//const legendeCopy = localStorage.getItem('legende');

document.getElementById('hinweis').textContent = hinweisCopy;
//document.getElementById('legende').textContent = legendeCopy;


let fakResult = document.getElementById("fakResult");
        let fak = document.getElementById("fakultaet");

$('#fakultaet').val(localStorage.getItem("fakultaet"));
$('#fakultaet').on('blur', function () {
    let value = $('#fakultaet').val();
    localStorage.setItem("fakultaet", value);
})
            
$('#fakResult').val($('#fakultaet').val());
    fakResult.addEventListener("change", function () {
    fakResult.value = fak.value;
    });

    fak.addEventListener('change', function () {
    fakResult.value = fak.value;
});
           
let pro = document.getElementById("programmNummer");
let proResult = document.getElementById("proResult");
$('#programmNummer').val(localStorage.getItem("programmNummer"));
$('#programmNummer').on('blur', function () {
    let value = $('#programmNummer').val();
    localStorage.setItem("programmNummer", value);
})
            
$('#proResult').val($('#programmNummer').val());
    proResult.addEventListener("change", function () {
    proResult.value = pro.value;
});

    pro.addEventListener('change', function () {
    proResult.value = pro.value;
    });
           
           
let sem = document.getElementById("sem");
let semResult = document.getElementById("semResult");

$('#sem').val(localStorage.getItem("sem"));
$('#sem').on('blur', function () {
    let value = $('#sem').val();
    localStorage.setItem("sem", value);
})
        
$('#semResult').val($('#sem').val());
    proResult.addEventListener("change", function () {
    semResult.value = sem.value;
});

    sem.addEventListener('change', function () {
    semResult.value = sem.value;
});

  
let semJahr = document.getElementById("semJahr");
let semJarResult = document.getElementById("semJahrResult");

$('#semJahr').val(localStorage.getItem("semJahr"));
 $('#semJahr').on('blur', function () {
    let value = $('#semJahr').val();
    localStorage.setItem("semJahr", value);
})

$('#semJahrResult').val($('#semJahr').val());
    semJarResult.addEventListener("change", function () {
    semJarResult.value = semJahr.value;
});

semJahr.addEventListener('change', function () {
semJarResult.value = semJahr.value;
});
