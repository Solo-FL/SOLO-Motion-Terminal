// Copyright: (c) 2020, SOLO motor controllers project
// GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)

var performanceMonitorActivation = false;
var performanceSerialReadingSizeToStart = 1000;
var performanceSerialShiftSize = 50;
var performanceDuration = 10000;
var performanceRefreshTimeout = 50;
//var delay = 100;
var performanceXVal= 0;
var performanceDataSize = 0;
var performanceRangeScaleId = "rangePerfromanceScale";
var performanceMonitorCleanId = "bMonitorCleanPerformance";
var performanceMonitorEvents;

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


function performanceOnRefresh(chart) {
    if(!performanceMonitorActivation){
        return;
    }

    
    

    var userdSerialShiftSize = performanceSerialShiftSize;
    var usedPerformanceDuration = performanceDuration;
    var realSize = serial.readingSizeByCommand('A0');

    //skip if signals are less then userdSerialShiftSize
    if(realSize< userdSerialShiftSize){
        setTimeout( performanceOnRefresh, performanceRefreshTimeout, chart);
        return;
    }

    //increase printed data if bugger go long
    //assumption all the command have similar size (difference 1/2 units)
    if(realSize>userdSerialShiftSize*1.3){
        userdSerialShiftSize = Math.floor(realSize *0.95);
    }

    var dataToSplice = 0;
    var dataPushed = userdSerialShiftSize;

    /*debug buffer size*/
    /*
    document.getElementById("boxActionHardwareVersion").value = serial.readingSize();
    document.getElementById("boxActionPosition").value = realSize;
    document.getElementById("boxActionTorqueIq").value = userdSerialShiftSize;
    */

    chart.config.data.datasets.forEach(function(dataset) {

        var myMessages = serial.shiftAllReadingsByCommand(dataset.commandValue,userdSerialShiftSize);
        var myValues = myMessages.map(message => message.toString().substring(8, 16));
        var myConvertedValues = myValues.map(value =>  convertToType(dataset.commandConversion , value.toString()));

        dataset.data.push(...myConvertedValues); 

        //check data to slice only 1 time x loop
        if(dataset.commandValue=='A0'){
            dataToSplice = dataset.data.length - usedPerformanceDuration;
        }

        //Take out data when we reach the windows size
        if(dataToSplice > 0){
            dataset.data.splice(0,dataToSplice);
        }

        if(dataset.commandValue=='A0'){
            performanceDataSize = dataset.data.length;
        }

    }); 

    if(dataToSplice > 0){
        chart.config.data.labels.splice(0,dataToSplice);
    }

    var xSize = chart.config.data.labels.length;
    if(dataPushed > 0 && performanceDataSize-usedPerformanceDuration>=0){
        
        var lastValue = 0;
        if(xSize>0){
            lastValue = chart.config.data.labels[xSize-1];
        }


        for(var li = 0; li<usedPerformanceDuration-xSize; li ++){
            chart.config.data.labels.push(lastValue+li); 
        }
    }


    chart.update();
    setTimeout( performanceOnRefresh, performanceRefreshTimeout, chart);
}

var color = Chart.helpers.color;
var performanceConfig = {
	type: 'bar',
	data: {
		labels: [],
		datasets: [{
            label: 'Position [Quad Pulses]',
            backgroundColor: window.chartColors.green,
            borderColor: window.chartColors.green,
            yAxisID: 'y-axis-PS',
            commandValue: 'A0',
            commandConversion: 'INT32',
            

			type: 'line',
			fill: false,
            cubicInterpolationMode: 'monotone',
            borderWidth: 1,
            pointRadius: 0,
            lineTension: 0,
            data: []
		}, {
            label: 'Iq [A]',
            backgroundColor: window.chartColors.blue,
            borderColor: window.chartColors.blue,
            yAxisID: 'y-axis-A',
            commandValue: '8D',
            commandConversion: 'SFXT',
            

			type: 'line',
			fill: false,
            cubicInterpolationMode: 'monotone',
            borderWidth: 1,
            pointRadius: 0,
            lineTension: 0,
			data: []
        }, {
            label: 'IM [A]',
            backgroundColor: window.chartColors.blue,
            borderColor: window.chartColors.blue,
            yAxisID: 'y-axis-A',
            commandValue: '87',
            commandConversion: 'SFXT',
            

			type: 'line',
			fill: false,
            cubicInterpolationMode: 'monotone',
            borderWidth: 1,
            pointRadius: 0,
            lineTension: 0,
			data: []
		}, {
            label: 'Angle [P.U.]',
            borderColor: window.chartColors.black,
            backgroundColor: window.chartColors.black,
            yAxisID: 'y-axis-PU',
            commandValue: 'B0',
            commandConversion: 'SFXT',
            

			type: 'line',
			fill: false,
            cubicInterpolationMode: 'monotone',
            borderWidth: 1,
            pointRadius: 0,
            lineTension: 0,
			data: []
		}, {
            label: 'Speed [RPM]',
            borderColor: window.chartColors.red,
            backgroundColor: window.chartColors.red,
            yAxisID: 'y-axis-RPM',
            commandValue: '96',
            commandConversion: 'UINT32',
           

			type: 'line',
			fill: false,
            cubicInterpolationMode: 'monotone',
            borderWidth: 1,
            pointRadius: 0,
            lineTension: 0,
			data: []
        }]
	},
	options: {

        legend: {
            labels: {
              padding: 20,
              fontSize:14,
            }
          },
    
        animation: {
            duration: 0
        },
		scales: {
			xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Samples',
                    fontSize:14,
                }
			}],
			yAxes: [{
                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                display: true,
                position: 'right',
                id: 'y-axis-PS',
                scaleLabel: {
                    display: true,
                    labelString: 'Quad Pulses',
                    fontSize:14,

                },
                 // grid line settings
                gridLines: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
            }, {
                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                display: true,
                position: 'left',
                id: 'y-axis-A',
                scaleLabel: {
                    display: true,
                    labelString: 'Amps',
                    fontSize:14,
                },

                // grid line settings
                gridLines: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
            },{
                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                display: true,
                position: 'left',
                id: 'y-axis-PU',
                scaleLabel: {
                    display: true,
                    labelString: 'P.U.',
                    fontSize:14,
                },

                // grid line settings
                gridLines: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
            },

            {
                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                display: true,
                position: 'right',
                id: 'y-axis-RPM',
                labelString: '[RPM]',
                scaleLabel: {
                    display: true,
                    labelString: 'RPM',
                    fontSize:14,
                },
            }]
		},
		tooltips: {
			mode: 'nearest',
			intersect: false
		},
		hover: {
			mode: 'nearest',
			intersect: false
		}
	}
};


function performanceDurationUpdate(duration){
    var xSize = window.myChart2.config.data.labels.length;

    if(performanceMonitorActivation){
        if(duration> performanceDuration){
            var lastValue = 0;
            if(xSize>0){
                lastValue =  window.myChart2.config.data.labels[xSize-1];
            }

            for(var li = 0; li<duration-performanceDuration; li ++){
                window.myChart2.config.data.labels.push(lastValue+1+li); 
            }
        }else{
            var unloadedData = performanceDuration - performanceDataSize;
            var toDelete = performanceDuration - duration ;
            if( unloadedData > 0){
                for(var li = 0; li<toDelete; li ++){
                    window.myChart2.config.data.labels.pop(); 

                    if(li>= unloadedData){
                        break;
                    }
                }
            }
        }
    }
    window.myChart2.update();
    performanceDuration = duration;
}

function performanceOnLoad() {
	var ctx = document.getElementById('myPerformanceChart').getContext('2d');
	window.myChart2 = new Chart(ctx, performanceConfig);
};

function performanceMonitorStart(){
    if (serial.connectionStatus!= "connected"){
        alert("please check the connection of SOLO");
        return;
    }

    if(monitorActivation) {
        alert("Generic Monitor is in action, stop it before activate Performance Monitor");
        return;
    }

    if(performanceDataSize == 0){
        for(var li = 0; li<performanceDuration; li ++){
            window.myChart2.config.data.labels.push(li); 
        }
    }

    document.getElementById(performanceRangeScaleId).disabled = false;
    document.getElementById(performanceMonitorCleanId).disabled = true;

    serial.monitorStart("02");
//    performanceMonitorEvents = [...window.myChart2.config.options.events];
//   window.myChart2.config.options.events.values = [];
//   window.myChart2.update();
    performanceMonitorStartStep2();
}

function performanceMonitorStartStep2(){
    if(performanceSerialReadingSizeToStart<serial.readingSize()){
        performanceMonitorActivation = true;
        document.getElementById("myPerformanceChart").classList.remove("bg-warning");
        performanceOnRefresh(window.myChart2);
    }else{
        setTimeout(performanceMonitorStartStep2,500);    
    }
}

function performanceMonitorStop(){
    if (serial.connectionStatus!= "connected"){
        alert("please check the connection of SOLO");
        return;
      }

    if(performanceMonitorActivation){
        performanceMonitorActivation = false;
        serial.cleanMonitorBuffer();
        document.getElementById(performanceRangeScaleId).disabled = true;
        document.getElementById(performanceMonitorCleanId).disabled = false;
    }

   // window.myChart2.config.options.events = performanceMonitorEvents;
   // window.myChart2.update();    
}



function performanceMonitorClean(){
    window.myChart2.config.data.datasets.forEach(function(dataset) {
        dataset.data = [];         
        });
    window.myChart2.config.data.labels =[];
    performanceXVal = 0;
    window.myChart2.update();
    performanceDataSize = 0
}