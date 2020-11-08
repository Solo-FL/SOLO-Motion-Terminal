var monitorActivation = false;

var chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};



function randomScalingFactor() {
	return (Math.random() > 0.5 ? 1.0 : -1.0) * Math.round(Math.random() * 100);
}

function onRefresh(chart) {
    if(!monitorActivation){
        return;
    }
    
	chart.config.data.labels.push(Date.now());
	chart.config.data.datasets.forEach(function(dataset) {
        var myMessage = serial.getLastReadingsByCommand(dataset.commandValue,15)
        var myValue = myMessage.substring(8, 16);
		dataset.data.push(convertToType(dataset.commandConversion , myValue));
	});
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
            hidden: true,

			type: 'line',
			fill: false,
            cubicInterpolationMode: 'monotone',
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
            hidden: true,

			type: 'line',
			fill: false,
            cubicInterpolationMode: 'monotone',
            pointRadius: 0,
            lineTension: 0,
			data: []
		}]
	},
	options: {
		title: {
			display: false,
			text: 'Monitor'
		},
		scales: {
			xAxes: [{
				type: 'realtime',
				realtime: {
					duration: 20000,
					refresh: 1,
                    delay: 5,
                    pause: true,
					onRefresh: onRefresh
				}
			}],
			yAxes: [{
                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                display: true,
                position: 'left',
                //stacked: true,
                id: 'y-axis-V',
                labelString: '[V]',

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
                labelString: '[A]',

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

document.getElementById('randomizeData').addEventListener('click', function() {
	config.data.datasets.forEach(function(dataset) {
		for (var i = 0; i < dataset.data.length; ++i) {
			dataset.data[i] = randomScalingFactor();
		}
	});

	window.myChart.update();
});

var colorNames = Object.keys(chartColors);
document.getElementById('addDataset').addEventListener('click', function() {
	var colorName = colorNames[config.data.datasets.length % colorNames.length];
	var newColor = chartColors[colorName];
	var newDataset = {
		label: 'Dataset ' + (config.data.datasets.length + 1),
		type: 'line',
		backgroundColor: color(newColor).alpha(0.5).rgbString(),
		borderColor: newColor,
		fill: false,
		cubicInterpolationMode: 'monotone',
		data: new Array(config.data.labels.length)
	};

	config.data.datasets.push(newDataset);
	window.myChart.update();
});

document.getElementById('removeDataset').addEventListener('click', function() {
	config.data.datasets.pop();
	window.myChart.update();
});

document.getElementById('addData').addEventListener('click', function() {
	onRefresh(window.myChart);
	window.myChart.update();
});

function moniotrStart(){
    monitorActivation = true;
    config.options.scales.xAxes[0].realtime.pause = false;

    /*
    window.myChart.destroy();
    var ctx = document.getElementById('myChart').getContext('2d');
    window.myChart = new Chart(ctx, config);
    */
}

function moniotrStop(){
    monitorActivation = false;
    config.options.scales.xAxes[0].realtime.pause = true;
}