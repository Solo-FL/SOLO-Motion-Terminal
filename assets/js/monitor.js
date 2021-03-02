// Copyright: (c) 2020, SOLO motor controllers project
// GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)

var monitorActivation = false;
var serialReadingSizeToStart = 1000;
var serialShiftSize = 50;
var duration = 1000;
var refresh = 50;
//var delay = 100;
var xVal= 0;
var datasetSize = 0;

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

    var userdSerialShiftSize = serialShiftSize;
    var realSize = serial.readingSizeByCommand('82');

    if(xVal < duration){
        //load duration at start
        for(var li = 0; li<duration; li ++){
            chart.config.data.labels.push(li); 
        }
        xVal = li;
    }else{
        if(realSize>userdSerialShiftSize*1.3){
            userdSerialShiftSize = realSize -20;
        }


        if(datasetSize>=duration){
        //after duration is full add new value
            for (var li = xVal; li<xVal+userdSerialShiftSize;li++){
                chart.config.data.labels.push(li); //not the same size at start of dataset (this one have fix value, ds less)
                if(chart.config.data.labels.length >duration){
                    chart.config.data.labels.shift();
                }
            }
            xVal=li;
        }


    
    }

	chart.config.data.datasets.forEach(function(dataset) {

        if(!(dataset.commandValue=='SUM')){
            var myMessages = serial.shiftAllReadingsByCommand(dataset.commandValue,userdSerialShiftSize);


            var myValues = myMessages.map(message => message.toString().substring(8, 16));
            var myConvertedValues = myValues.map(value =>  convertToType(dataset.commandConversion , value.toString()));
            dataset.data.push(...myConvertedValues);    

            if(dataset.data.length >duration){
                dataset.data.splice(0,dataset.data.length-duration);
            }

            datasetSize = dataset.data.length;

            /*debug*/
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
            

        }else{
            if(dataset.label=='VC [V]'){
                dataset.data = chart.config.data.datasets[0].data.map((val, i) => val + chart.config.data.datasets[1].data[i]);
            }
            
            if(dataset.label=='IC [A]'){
                dataset.data = chart.config.data.datasets[3].data.map((val, i) => val + chart.config.data.datasets[4].data[i]);
            }
        }

    });
    

    chart.update();
    setTimeout( onRefresh, refresh, chart);
}

var color = Chart.helpers.color;
var config = {
	type: 'bar',
	data: {
		labels: [],
		datasets: [{
            label: 'VA [V]',
            backgroundColor: window.chartColors.blue,
            borderColor: window.chartColors.blue,
            yAxisID: 'y-axis-V',
            commandValue: '82',
            commandConversion: 'SFXT',
            hidden: true,

			type: 'line',
			fill: false,
            cubicInterpolationMode: 'monotone',
            borderWidth: 1,
            pointRadius: 0,
            lineTension: 0,
            data: []
		}, {
            label: 'VB [V]',
            backgroundColor: window.chartColors.green,
            borderColor: window.chartColors.green,
            yAxisID: 'y-axis-V',
            commandValue: '83',
            commandConversion: 'SFXT',
            hidden: true,

			type: 'line',
			fill: false,
            cubicInterpolationMode: 'monotone',
            borderWidth: 1,
            pointRadius: 0,
            lineTension: 0,
			data: []
        }, {
            label: 'VC [V]',
            backgroundColor: window.chartColors.black,
            borderColor: window.chartColors.black,
            yAxisID: 'y-axis-V',
            commandValue: 'SUM',
            hidden: true,

			type: 'line',
			fill: false,
            cubicInterpolationMode: 'monotone',
            borderWidth: 1,
            pointRadius: 0,
            lineTension: 0,
			data: []
		}, {
            label: 'IA [A]',
            borderColor: window.chartColors.navy,
            backgroundColor: window.chartColors.navy,
            yAxisID: 'y-axis-A',
            commandValue: '84',
            commandConversion: 'SFXT',
            hidden: true,

			type: 'line',
			fill: false,
            cubicInterpolationMode: 'monotone',
            borderWidth: 1,
            pointRadius: 0,
            lineTension: 0,
			data: []
		}, {
            label: 'IB [A]',
            borderColor: window.chartColors.teal,
            backgroundColor: window.chartColors.teal,
            yAxisID: 'y-axis-A',
            commandValue: '85',
            commandConversion: 'SFXT',
            hidden: true,

			type: 'line',
			fill: false,
            cubicInterpolationMode: 'monotone',
            borderWidth: 1,
            pointRadius: 0,
            lineTension: 0,
			data: []
        }, {
            label: 'IC [A]',
            borderColor: window.chartColors.yellow,
            backgroundColor: window.chartColors.yellow,
            yAxisID: 'y-axis-A',
            commandValue: 'SUM',
            hidden: true,

			type: 'line',
			fill: false,
            cubicInterpolationMode: 'monotone',
            borderWidth: 1,
            pointRadius: 0,
            lineTension: 0,
			data: []
		},{
            label: 'Vsupply [V]',
            borderColor: window.chartColors.acqua,
            backgroundColor: window.chartColors.acqua,
            yAxisID: 'y-axis-V',
            commandValue: '86',
            commandConversion: 'SFXT',

			type: 'line',
			fill: false,
            cubicInterpolationMode: 'monotone',
            borderWidth: 1,
            pointRadius: 0,
            lineTension: 0,
			data: []
		}, {
            label: 'IM_DC motor [A]',
            borderColor: window.chartColors.orange,
            backgroundColor: window.chartColors.orange,
            yAxisID: 'y-axis-A',
            commandValue: '87',
            commandConversion: 'SFXT', 
            hidden: true,           

			type: 'line',
			fill: false,
            cubicInterpolationMode: 'monotone',
            borderWidth: 1,
            pointRadius: 0,
            lineTension: 0,
			data: []
		}, {
            label: 'VM_DC motor [V]',
            borderColor: window.chartColors.lime,
            backgroundColor: window.chartColors.lime,
            yAxisID: 'y-axis-V',
            commandValue: '88',
            commandConversion: 'SFXT',
            hidden: true,

			type: 'line',
			fill: false,
            cubicInterpolationMode: 'monotone',
            borderWidth: 1,
            pointRadius: 0,
            lineTension: 0,
			data: []
		}, {
            label: 'Iq _ Torque [A]',
            borderColor: window.chartColors.purple,
            backgroundColor: window.chartColors.purple,
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
            label: 'Id _ Magnetizing Current [A]',
            borderColor: window.chartColors.olive,
            backgroundColor: window.chartColors.olive,
            yAxisID: 'y-axis-A',
            commandValue: '8E',
            commandConversion: 'SFXT',
            hidden: true,

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
                position: 'left',
                id: 'y-axis-V',
                scaleLabel: {
                    display: true,
                    labelString: 'Volts',
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

window.onload = function() {
	var ctx = document.getElementById('myChart').getContext('2d');
	window.myChart = new Chart(ctx, config);
    performanceOnLoad();
};

function monitorStart(){
    if(performanceMonitorActivation) {
        alert("Performance Monitor is in action, stop it before activate Generic Monitor");
        return;
    }

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
    if(monitorActivation){
        monitorActivation = false;
        serial.cleanMonitorBuffer();
    }
}



function monitorClean(){
    window.myChart.config.data.datasets.forEach(function(dataset) {
        dataset.data = [];         
        });
    window.myChart.config.data.labels =[];
    xVal = 0;
    window.myChart.update();
}