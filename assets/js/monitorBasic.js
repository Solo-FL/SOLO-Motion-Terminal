var monitorActivation = false;
var serialReadingSizeToStart = 2000;
var serialShiftSize = 50;
var duration = 1000;
var refresh = 50;
//var delay = 100;
var xVal= 0;

var chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
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
            backgroundColor: window.chartColors.yellow,
            borderColor: window.chartColors.yellow,
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
            backgroundColor: window.chartColors.yellow,
            borderColor: window.chartColors.yellow,
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
            borderColor: window.chartColors.peach,
            backgroundColor: window.chartColors.peach,
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
            borderColor: window.chartColors.peach,
            backgroundColor: window.chartColors.peach,
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
            borderColor: window.chartColors.grey,
            backgroundColor: window.chartColors.grey,
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
            borderColor: window.chartColors.green,
            backgroundColor: window.chartColors.green,
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
            borderColor: window.chartColors.green,
            backgroundColor: window.chartColors.green,
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
            borderColor: window.chartColors.blue,
            backgroundColor: window.chartColors.blue,
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
            borderColor: window.chartColors.blue,
            backgroundColor: window.chartColors.blue,
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
                    labelString: 'Simple'
                }
			}],
			yAxes: [{
                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                display: true,
                position: 'left',
                //stacked: true,
                id: 'y-axis-V',
                scaleLabel: {
                    display: true,
                    labelString: 'Volt',
                },
                 // grid line settings
                gridLines: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
            }, {
                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                display: true,
                position: 'left',
                stacked: true,
                id: 'y-axis-A',
                scaleLabel: {
                    display: true,
                    labelString: 'Amps',
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
                stacked: true,
                id: 'y-axis-RPM',
                labelString: '[RPM]',
                scaleLabel: {
                    display: true,
                    labelString: 'RPM',
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

