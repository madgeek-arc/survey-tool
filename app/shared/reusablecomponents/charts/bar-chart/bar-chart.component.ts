import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import * as Highcharts from "highcharts";
import { LegendOptions, SeriesOptionsType } from "highcharts";

@Component({
  selector: 'app-multi-bar-chart',
  template: '<highcharts-chart [Highcharts]="Highcharts" [options]="chartOptions" [callbackFunction]="chartCallback" style="width: 100%; height: 100%; display: block;"></highcharts-chart>',
})

export class BarChartComponent implements OnChanges {
  @Input() series: SeriesOptionsType[] = [];
  @Input() categories: string[] = [];
  @Input() titles = {title: '', xAxis: '', yAxis: ''};
  @Input() stacking?: Highcharts.OptionsStackingValue;
  @Input() legendOptions?: LegendOptions = {};
  @Input() borderRadius?: (number|string|Highcharts.BorderRadiusOptionsObject) = undefined;
  @Input() pointWidth?: number = undefined;
  @Input() valueSuffix?: string = undefined;
  @Input() customTooltip?: boolean = false;
  @Input() yAxisLabels?: boolean = true;


  Highcharts: typeof Highcharts = Highcharts;
  chart!: Highcharts.Chart;
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'bar'
    },
    title: {
      text: this.titles.title,
      align: 'left'
    },
    xAxis: {
      categories: this.categories,
      title: {
        text: this.titles.xAxis
      },
      gridLineWidth: 1,
      lineWidth: 0
    },
    yAxis: {
      min: 0,
      title: {
        text: this.titles.yAxis,
        align: 'high'
      },
      labels: {
        overflow: 'justify'
      },
      gridLineWidth: 0
    },
    tooltip: {
      valueSuffix: this.valueSuffix,
    },
    plotOptions: {
      bar: {
        borderRadius: this.borderRadius,
        dataLabels: {
          enabled: true
        },
        groupPadding: 0.1
      },
      series: {
        stacking: this.stacking
      },
    },
    legend: this.legendOptions,
    credits: {
      enabled: false
    },
    series: []
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateChart();
  }

  updateChart() {
    if (this.chart) {
      this.chart.update({
        title: {
          text: this.titles.title
        },
        xAxis: {
          type: 'category',
          categories: this.categories,
          title: {
            text: this.titles.xAxis
          }
        },
        yAxis: {
          title: {
            text: this.titles.yAxis,
          },
          labels: {
            enabled: this.yAxisLabels
          }
        },
        tooltip: {
          valueSuffix: this.valueSuffix,
          // pointFormat: '{series.name}: {point.y}',
          headerFormat: this.customTooltip ? '<b>{series.name}</b><br>' : undefined,
          pointFormatter: this.customTooltip ? function () {
            return   'Countries: ' + this.series.userOptions.custom;
          } : undefined
        },
        plotOptions: {
          bar: {
            borderRadius: this.borderRadius,
            pointWidth: this.pointWidth,
            dataLabels: {
              enabled: true
            },
            groupPadding: 0.1
          },
          series: {
            stacking: this.stacking
          },
        },
        legend: this.legendOptions,
        series: this.series as SeriesOptionsType[]
      }, true, true, true);
    } else {

    }
  }


  chartCallback = (chart: Highcharts.Chart) => {
    this.chart = chart;
    this.updateChart(); // Ensure the chart is updated on initialization

  };

}
