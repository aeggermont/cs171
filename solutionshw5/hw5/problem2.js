//var graphCanvas = document.getElementById('graphCanvas');
//var graphContext = graphCanvas.getContext('2d');
//var displayCanvas = document.getElementById('displayCanvas');
//var displayContext = displayCanvas.getContext('2d');
var data1_CSV = document.getElementById('csv').value;
var data2_JSON = document.getElementById('JSON').value;


console.log(data1_CSV);
console.log(data2_JSON);

var dataCollection = new Array();

function testjs(){

    var typeOfTest = new Array();
    var x = 5;

    typeOfTest[0] = "typeof(2410)";
    typeOfTest[1] = "typeof('this is a test string')";
    typeOfTest[2] = "typeof (new Date())";
    typeOfTest[3] = "typeof (null)";
    typeOfTest[4] = "typeof (navigator)";
    typeOfTest[5] = "typeof (parseInt)";
    typeOfTest[6] = "typeof (true)";
    typeOfTest[7] = "typeof (typeOfTest)";
    typeOfTest[8] = "typeof(x)";
    typeOfTest[9] = "typeof(y)";
    typeOfTest[10] = "0/0";
    typeOfTest[11] = "1/0";

    console.log(typeOfTest.length);

    for ( var i = 0; i < typeOfTest.length; i++) {
        console.log("About to start testing... ");
        console.log(typeOfTest[i]);
        document.write(typeOfTest[i] + " : " + eval(typeOfTest[i]) + "<BR/>");
    }
}

S = [ x for x**2 in range(10)]


function getDataCSV() {

    //console.log("Length of the string: ");
    //console.log(data1_CSV.length);
    dataIn = data1_CSV.split('\n');
    //console.log(dataIn.length);
    // theDiv = document.getElementById('data');
    var container = document.getElementById('dataContainer');

    for( i=0 ; i < dataIn.length; i++){
        var newDiv = document.createElement('div');
        newDiv.setAttribute('id', 'dataIn' + i );
        dataCollection[i] = new Array(dataIn[i].split(','));
        newDiv.innerHTML = dataIn[i];
        container.appendChild(newDiv);
    }

    for (i =0 ; i < dataCollection.length; i++){
        console.log(dataCollection[i]);
    }
}