var monitorActivation = false;
var serialReadingSizeToStart = 1000;
var serialShiftSize = 50;
var duration = 1000;
var refresh = 50;
//var delay = 100;
var xVal= 0;

var chartColors = {
	navy: '#001F3F',
	blue: '#0074D9',
	acqua: '#39CCCC',
	teal: '#2ECC40',
	green: '#01FF70',
	lime: '#FFDC00',
    orange: 'r#FF851B',
    red: '#FF4136' ,
    purple: '#B10DC9',
    black: '#111111',
    olive: '#3D9970'
};

function onRefresh(chart) {
    if(!monitorActivation){
        return;
    }

    for (var li = xVal; li<xVal+serialShiftSize;li++){
        chart.config.data.labels.push(li);
        if(chart.config.data.labels.length >duration){
            chart.config.data.labels.shift();
        }
    }
    xVal=li;

	chart.config.data.datasets.forEach(function(dataset) {
       var myMessages = serial.shiftAllReadingsByCommand(dataset.commandValue,serialShiftSize);

        var myValues = myMessages.map(message => message.toString().substring(8, 16));
        var myConvertedValues = myValues.map(value =>  convertToType(dataset.commandConversion , value.toString()));
        dataset.data.push(...myConvertedValues);    
        
       if(dataset.data.length >duration){
        dataset.data.splice(0,dataset.data.length-duration);
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
};

function moniotrStart(){
    if(serialReadingSizeToStart<serial.readingSize()){
        monitorActivation = true;
        onRefresh(window.myChart);
    }else{
        setTimeout(moniotrStart,500);    
    }
}

function moniotrStop(){
    monitorActivation = false;
}
