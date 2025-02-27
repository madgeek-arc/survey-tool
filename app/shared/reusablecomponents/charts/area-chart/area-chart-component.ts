import { Component } from "@angular/core";
import * as Highcharts from "highcharts";

@Component({
  selector: "app-area-chart",
  template: '<highcharts-chart [Highcharts]="Highcharts" [options]="chartOptions" [callbackFunction]="chartCallback" style="width: 100%; height: 100%; display: block;"></highcharts-chart>',
})

export class AreaChartComponent {



  Highcharts: typeof Highcharts = Highcharts;
  chart!: Highcharts.Chart;
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'area'
    },
    title: {
      text: 'Selected Open Science Indicators in Time'
    },
    xAxis: {
      allowDecimals: false,
      accessibility: {
        rangeDescription: 'Range: 2015 to 2023.'
      }
    },
    yAxis: {
      title: {
        text: ''
      }
    },
    tooltip: {
      pointFormat: 'Number of {series.name}  <b>{point.y:,.0f}</b><br/>' +
        ' in {point.x}'
    },
    plotOptions: {
      area: {
        pointStart: 2015,
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 2,
          states: {
            hover: {
              enabled: true
            }
          }
        }
      }
    },
    credits: {
      enabled: false
    },
    series: [
      {
        name: 'Open Access Publication',
        type: 'area',
        data: [ 26008, 25830, 26516, 27835, 28537, 27119, 32914, 25542, 24418 ]
      }, {
        name: 'Open Access Datasets',
        type: 'area',
        data: [ 3346, 4259, 1242, 6144, 7091, 8400, 7490, 10671, 11736 ]
      }, {
        name: 'Open Software',
        type: 'area',
        data: [ 1346, 1259, 1242, 1144, 2091, 1400, 1490, 671, 1736, ]
      },
    ]
  }

  updateChart() {
    if (this.chart) {

    }
  }

  chartCallback = (chart: Highcharts.Chart) => {
    this.chart = chart;
    this.updateChart(); // Ensure the chart is updated on initialization
  };
}
