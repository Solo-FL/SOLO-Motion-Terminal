// Copyright: (c) 2020, SOLO motor controllers project
// GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)

var performanceMonitorActivation = false;
var performanceSerialReadingSizeToStart = 1000;
var performanceSerialShiftSize = 25;
var performanceDuration = 10000;
var performanceRefreshTimeout = 25;
//var delay = 100;
var performanceXVal= 0;
var performanceDataSize = 0;
var performanceRangeScaleId = "rangePerfromanceScale";
var performanceMonitorCleanId = "bMonitorCleanPerformance";
var performanceMonitorEvents;
var performanceSoloLog = new soloLog();

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
    var torqueConstant = document.getElementById("boxTorqueConstant").value;
    if(torqueConstant!=0){
        chart.config.data.datasets[1].label = "Torque [N.m]";
        chart.options.scales.y_axis_A.title.text = "Amps / N.m";
    }else{
        chart.config.data.datasets[1].label = "Iq [A]";
        chart.options.scales.y_axis_A.title.text = "Amps";
    }

    chart.config.data.datasets.forEach(function(dataset) {

        
        var myMessages = serial.shiftAllReadingsByCommand(dataset.commandValue,userdSerialShiftSize);
        var myValues = myMessages.map(message => message.toString().substring(8, 16));
        var myConvertedValues = myValues.map(value =>  convertToType(dataset.commandConversion , value.toString()));

        
        if(dataset.commandValue == '8D' ){
            if(torqueConstant!=0){
                myConvertedValues = myConvertedValues.map(e => e  * torqueConstant);
            }
        }
 
        dataset.data.push(...myConvertedValues);
        performanceSoloLog.saveItem(dataset.label, myConvertedValues ); 

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
	type: 'line',
	data: {
		labels: [],
		datasets: [{
            label: 'Position [Quad Pulses]',
            backgroundColor: window.chartColors.green,
            borderColor: window.chartColors.green,
            yAxisID: 'y_axis_PS',
            commandValue: 'A0',
            commandConversion: 'INT32',
            
			type: 'line',
            data: []
		}, {
            label: 'Iq [A]',
            backgroundColor: window.chartColors.blue,
            borderColor: window.chartColors.blue,
            yAxisID: 'y_axis_A',
            commandValue: '8D',
            commandConversion: 'SFXT',
            
			type: 'line',
			data: []
        }, {
            label: 'IM [A]',
            backgroundColor: window.chartColors.blue,
            borderColor: window.chartColors.blue,
            yAxisID: 'y_axis_A',
            commandValue: '87',
            commandConversion: 'SFXT',
            
			type: 'line',
			data: []
		}, {
            label: 'Angle [P.U.]',
            borderColor: window.chartColors.black,
            backgroundColor: window.chartColors.black,
            yAxisID: 'y_axis_PU',
            commandValue: 'B0',
            commandConversion: 'SFXT',
            
			type: 'line',
			data: []
		}, {
            label: 'Speed [RPM]',
            borderColor: window.chartColors.red,
            backgroundColor: window.chartColors.red,
            yAxisID: 'y_axis_RPM',
            commandValue: '96',
            commandConversion: 'INT32',
           
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
                    },
                }
			},
			y_axis_PS: {
                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Quad Pulses',
                    font:{
                        size:14,
                    },

                },
                 // grid line settings
                grid: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
            },
            y_axis_A: {
                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Amps',
                    font:{
                        size:14,
                    },
                },

                // grid line settings
                grid: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
            },
            y_axis_PU:{
                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'P.U.',
                    font:{
                        size:14,
                    },
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
        if(confirm("Please check the connection of SOLO, \nTry to connect?")){
            initConnection();
        }
        return
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
    document.getElementById("bMonitorStartPerformance").disabled = true;
    document.getElementById("bMonitorStart").disabled = true;
    document.getElementById("bMonitorStopPerformance").disabled = false;

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
        if(confirm("Please check the connection of SOLO, \nTry to connect?")){
            initConnection();
        }
        return
      }

    if(performanceMonitorActivation){
        performanceMonitorActivation = false;
        serial.cleanMonitorBuffer();
        document.getElementById(performanceRangeScaleId).disabled = true;
        document.getElementById(performanceMonitorCleanId).disabled = false;

        document.getElementById("bMonitorStartPerformance").disabled = false;
        document.getElementById("bMonitorStart").disabled = false;
        document.getElementById("bMonitorStopPerformance").disabled = true;
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

function performanceMonitorLogStart() {
    if(monitorSoloLog.isRecordingActivated){
        alert("A different log is active");
    }else{
        performanceSoloLog.start();
        document.getElementById("bLogStartPerformance").disabled = true;
        document.getElementById("bLogStart").disabled = true;
        document.getElementById("bLogStopPerformance").disabled = false;
    }
}

function performanceMonitorLogStopAndSave(){
    if(monitorSoloLog.isRecordingActivated){
        alert("A different log is active");
    }else{
        performanceSoloLog.stopAndSave();
        document.getElementById("bLogStartPerformance").disabled = false;
        document.getElementById("bLogStart").disabled = false;
        document.getElementById("bLogStopPerformance").disabled = true;
    }
}