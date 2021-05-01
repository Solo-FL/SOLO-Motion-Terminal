// Copyright: (c) 2020, SOLO motor controllers project
// GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)

var monitorActivation = false;
var serialReadingSizeToStart = 1000;
var serialShiftSize = 50;
var duration = 1000;
var refresh = 50;
//var delay = 100;
var xVal= 0;
var dataSize = 0;
var rangeScaleId = "rangeScale";
var monitorCleanId = "bMonitorClean";

var chartColors = {
	navy: '#84144B',
	blue: '#0074D9',
	acqua: '#7FDBFF',
	teal: '#39CCCC',
	green: '#2ECC40',
	lime: '#01FF70',
    orange: '#FF851B',
    red: '#FF4136' ,
    purple: '#B10DC9',
    black: '#111111',
    olive: '#3D9970',
    yellow: '#FFDC00'
};

function onRefresh(chart) {
    if(!monitorActivation){
        return;
    }

    var usedDuration = duration;
    var userdSerialShiftSize = serialShiftSize;

    var realSize = serial.readingSizeByCommand('82');
    if(realSize>userdSerialShiftSize*1.3){
        userdSerialShiftSize = realSize -20;
    }

    /*debug buffer size*/
    /*
    document.getElementById("boxActionHardwareVersion").value = serial.readingSize();
    document.getElementById("boxActionPosition").value = realSize;
    document.getElementById("boxActionTorqueIq").value = userdSerialShiftSize;
    */
   
    var dataToSplice = 0;
    var dataPushed = 0;

	chart.config.data.datasets.forEach(function(dataset) {

        if(!(dataset.commandValue=='SUM')){
            var myMessages = serial.shiftAllReadingsByCommand(dataset.commandValue,userdSerialShiftSize);


            var myValues = myMessages.map(message => message.toString().substring(8, 16));
            var myConvertedValues = myValues.map(value =>  convertToType(dataset.commandConversion , value.toString()));
            dataset.data.push(...myConvertedValues);    
            dataPushed = myConvertedValues.length;

            dataSize = dataset.data.length;
            dataToSplice = dataSize-usedDuration;

            if(dataToSplice > 0){
                dataset.data.splice(0,dataToSplice);
            }
            dataSize = dataset.data.length;

            /*debug*/
            /*
            if(dataset.commandValue == '96') {
                for (var vii = 0; vii<myConvertedValues.length ; vii++){
                    var valuee = parseInt(myConvertedValues[vii])
                    if(valuee!=0){
                        datasetSize = dataset.data.length;
                    }
                }
            }
            if(dataset.commandValue == '83') {
                for (var vii = 0; vii<myConvertedValues.length ; vii++){
                    var valuee = parseInt(myConvertedValues[vii])
                    if(valuee>100 || valuee <100){
                        datasetSize = dataset.data.length;
                    }
                }
            }
            */

        }else{
            if(dataset.label=='VC [V]'){
                dataset.data = chart.config.data.datasets[0].data.map((val, i) => val + chart.config.data.datasets[1].data[i]);
            }
            
            if(dataset.label=='IC [A]'){
                dataset.data = chart.config.data.datasets[3].data.map((val, i) => val + chart.config.data.datasets[4].data[i]);
            }
        }

    });
    
    if(dataToSplice > 0){
        chart.config.data.labels.splice(0,dataToSplice);
    }

    var xSize = chart.config.data.labels.length;
    if(dataPushed > 0 && dataSize-usedDuration>=0){
        
        var lastValue = 0;
        if(xSize>0){
            lastValue = chart.config.data.labels[xSize-1];
        }


        for(var li = 0; li<usedDuration-xSize; li ++){
            chart.config.data.labels.push(lastValue+li); 
        }
    }

    chart.update();
    setTimeout( onRefresh, refresh, chart);
}

var color = Chart.helpers.color;
var config = {
	type: 'line',
	data: {
		labels: [],
		datasets: [{
            label: 'VA [V]',
            backgroundColor: window.chartColors.blue,
            borderColor: window.chartColors.blue,
            yAxisID: 'y_axis_V',
            commandValue: '82',
            commandConversion: 'SFXT',
            hidden: true,

			type: 'line',
            data: []
		}, {
            label: 'VB [V]',
            backgroundColor: window.chartColors.green,
            borderColor: window.chartColors.green,
            yAxisID: 'y_axis_V',
            commandValue: '83',
            commandConversion: 'SFXT',
            hidden: true,

			type: 'line',
			data: []
        }, {
            label: 'VC [V]',
            backgroundColor: window.chartColors.black,
            borderColor: window.chartColors.black,
            yAxisID: 'y_axis_V',
            commandValue: 'SUM',
            hidden: true,

			type: 'line',
			data: []
		}, {
            label: 'IA [A]',
            borderColor: window.chartColors.navy,
            backgroundColor: window.chartColors.navy,
            yAxisID: 'y_axis_A',
            commandValue: '84',
            commandConversion: 'SFXT',
            hidden: true,

			type: 'line',
			data: []
		}, {
            label: 'IB [A]',
            borderColor: window.chartColors.teal,
            backgroundColor: window.chartColors.teal,
            yAxisID: 'y_axis_A',
            commandValue: '85',
            commandConversion: 'SFXT',
            hidden: true,

			type: 'line',
			data: []
        }, {
            label: 'IC [A]',
            borderColor: window.chartColors.yellow,
            backgroundColor: window.chartColors.yellow,
            yAxisID: 'y_axis_A',
            commandValue: 'SUM',
            hidden: true,

			type: 'line',
			data: []
		},{
            label: 'Vsupply [V]',
            borderColor: window.chartColors.acqua,
            backgroundColor: window.chartColors.acqua,
            yAxisID: 'y_axis_V',
            commandValue: '86',
            commandConversion: 'SFXT',

			type: 'line',
			data: []
		}, {
            label: 'IM_DC motor [A]',
            borderColor: window.chartColors.orange,
            backgroundColor: window.chartColors.orange,
            yAxisID: 'y_axis_A',
            commandValue: '87',
            commandConversion: 'SFXT', 
            hidden: true,           

			type: 'line',
			data: []
		}, {
            label: 'VM_DC motor [V]',
            borderColor: window.chartColors.lime,
            backgroundColor: window.chartColors.lime,
            yAxisID: 'y_axis_V',
            commandValue: '88',
            commandConversion: 'SFXT',
            hidden: true,

			type: 'line',
			data: []
		}, {
            label: 'Iq _ Torque [A]',
            borderColor: window.chartColors.purple,
            backgroundColor: window.chartColors.purple,
            yAxisID: 'y_axis_A',
            commandValue: '8D',
            commandConversion: 'SFXT',
            

			type: 'line',
			data: []
		}, {
            label: 'Id _ Magnetizing Current [A]',
            borderColor: window.chartColors.olive,
            backgroundColor: window.chartColors.olive,
            yAxisID: 'y_axis_A',
            commandValue: '8E',
            commandConversion: 'SFXT',
            hidden: true,

			type: 'line',
			data: []
		}, {
            label: 'Speed [RPM]',
            borderColor: window.chartColors.red,
            backgroundColor: window.chartColors.red,
            yAxisID: 'y_axis_RPM',
            commandValue: '96',
            commandConversion: 'UINT32',
            

			type: 'line',
			data: []
		}]
	},
	options: {
        animation: false,
        spanGaps: true,
        pointRadius : 0,
        borderWidth: 1,
        cubicInterpolationMode: 'monotone',

        plugins :{
            tooltip: {
                //enabled : false,
               position : 'nearest',
		    },
            legend: {
                labels: {
                  padding: 20,
                  font:{
                    size:14,
                  },
                }
              },
        },

		scales: {
			x: {
                display: true,
                title: {
                    display: true,
                    text: 'Samples',
                    font:{
                        size:14,
                    }
                }
			},
			y_axis_V: {
                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Volts',
                    font:{
                        size:14,
                    },
                },
                 // grid line settings
                grid: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
            }, 
            y_axis_A:{
                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Amps',
                    font : {
                        size:14,
                    }
                },

                // grid line settings
                grid: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
            },

            y_axis_RPM:{
                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'RPM',
                    font:{
                        size:14,
                    },
                },
            }
		},
	}
};

window.onload = function() {
	var ctx = document.getElementById('myChart').getContext('2d');
	window.myChart = new Chart(ctx, config);
    performanceOnLoad();
};

function durationUpdate(inputDuration){
    var xSize = window.myChart.config.data.labels.length;

    if(monitorActivation){
        if(inputDuration> duration){
            var lastValue = 0;
            if(xSize>0){
                lastValue =  window.myChart.config.data.labels[xSize-1];
            }

            for(var li = 0; li<inputDuration-duration; li ++){
                window.myChart.config.data.labels.push(lastValue+1+li); 
            }
        }else{
            var unloadedData = duration - dataSize;
            var toDelete = duration - inputDuration ;
            if( unloadedData > 0){
                for(var li = 0; li<toDelete; li ++){
                    window.myChart.config.data.labels.pop(); 

                    if(li>= unloadedData){
                        break;
                    }
                }
            }
        }

        window.myChart.update();
    }
    
    duration = inputDuration;
}

function monitorStart(){
    if (serial.connectionStatus!= "connected"){
        alert("please check the connection of SOLO");
        return;
    }

    if(performanceMonitorActivation) {
        alert("Performance Monitor is in action, stop it before activate Generic Monitor");
        return;
    }

    if(dataSize == 0){
        for(var li = 0; li<duration; li ++){
            window.myChart.config.data.labels.push(li); 
        }
    }

    document.getElementById(rangeScaleId).disabled = false;
    document.getElementById(monitorCleanId).disabled = true;
    
    serial.monitorStart("01");
    monitorStartStep2();
    
}

function monitorStartStep2(){
    if(serialReadingSizeToStart<serial.readingSize()){
        monitorActivation = true;
        document.getElementById("myChart").classList.remove("bg-warning");
        onRefresh(window.myChart);
    }else{
        setTimeout(monitorStartStep2,500);    
    }
}

function monitorStop(){
    if (serial.connectionStatus!= "connected"){
        alert("please check the connection of SOLO");
        return;
      }
      
    if(monitorActivation){
        monitorActivation = false;
        serial.cleanMonitorBuffer();
        document.getElementById(rangeScaleId).disabled = true;
        document.getElementById(monitorCleanId).disabled = false;
    }
}



function monitorClean(){
    window.myChart.config.data.datasets.forEach(function(dataset) {
        dataset.data = [];         
        });
    window.myChart.config.data.labels =[];
    xVal = 0;
    window.myChart.update();
    dataSize = 0;
}