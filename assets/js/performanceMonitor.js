// Copyright: (c) 2020, SOLO motor controllers project
// GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)

var performanceMonitorActivation = false;
var performanceSerialReadingSizeToStart = 1000;
var performanceSerialShiftSize = 50;
var performanceDuration = 1000;
var performanceRefreshTimeout = 25;
//var delay = 100;
var performanceXVal= 0;
var performanceDatasetSize = 0;

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
    var realSize = serial.readingSizeByCommand('A0');

    if(performanceXVal < performanceDuration){
        //load duration at start
        for(var li = 0; li<performanceDuration; li ++){
            chart.config.data.labels.push(li); 
        }
        performanceXVal = li;
    }else{
        if(realSize>userdSerialShiftSize*1.3){
            userdSerialShiftSize = realSize -20;
        }

        if(performanceDatasetSize>=performanceDuration){
        //after duration is full add new value
            for (var li = performanceXVal; li<performanceXVal+userdSerialShiftSize;li++){
                chart.config.data.labels.push(li); //not the same size at start of dataset (this one have fix value, ds less)
                if(chart.config.data.labels.length >performanceDuration){
                    chart.config.data.labels.shift();
                }
            }
            performanceXVal=li;
        }
    }

    serial.shiftAllReadingsByCommand('00',null);

    chart.config.data.datasets.forEach(function(dataset) {

        if(serial.itHasAllReadingsByCommand(dataset.commandValue,userdSerialShiftSize)==false){
            return;
        }

        var myMessages = serial.shiftAllReadingsByCommand(dataset.commandValue,userdSerialShiftSize);
        var myValues = myMessages.map(message => message.toString().substring(8, 16));
        var myConvertedValues = myValues.map(value =>  convertToType(dataset.commandConversion , value.toString()));

        dataset.data.push(...myConvertedValues);    

        if(dataset.data.length >performanceDuration){
            dataset.data.splice(0,dataset.data.length-performanceDuration);
        }

        performanceDatasetSize = dataset.data.length;
        
    });  

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
            borderColor: window.chartColors.orange,
            backgroundColor: window.chartColors.orange,
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


function performanceOnLoad() {
	var ctx = document.getElementById('myPerformanceChart').getContext('2d');
	window.myChart2 = new Chart(ctx, performanceConfig);
};

function performanceMonitorStart(){
    if(monitorActivation) {
        alert("Generic Monitor is in action, stop it before activate Performance Monitor");
        return;
    }

    serial.monitorStart("02");
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
    if(performanceMonitorActivation){
        performanceMonitorActivation = false;
        serial.cleanMonitorBuffer();
    }
        
}



function performanceMonitorClean(){
    window.myChart2.config.data.datasets.forEach(function(dataset) {
        dataset.data = [];         
        });
    window.myChart2.config.data.labels =[];
    performanceXVal = 0;
    window.myChart2.update();
}