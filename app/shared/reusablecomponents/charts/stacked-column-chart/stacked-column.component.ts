import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import * as Highcharts from "highcharts";
import { OptionsStackingValue } from "highcharts";

@Component({
  selector: "app-stacked-column",
  template: '<highcharts-chart [Highcharts]="Highcharts" [options]="chartOptions" [callbackFunction]="chartCallback" style="width: 100%; height: 100%; display: block;"></highcharts-chart>',
})

export class StackedColumnComponent implements OnChanges {

  @Input() series: Highcharts.SeriesColumnOptions[] = [];
  @Input() title: string = null;
  @Input() subTitle: string = null;
  @Input() categories: string[] = [];
  @Input() xAxis: string = null;
  @Input() yAxis: string = null;
  @Input() yAxisMax: number = null;
  @Input() yAxisLabelsFormat: string = null;
  @Input() stackLabels: boolean = true;
  @Input() dataLabels: boolean = true;
  @Input() pointFormat: string = null;
  @Input() plotFormat: string = null;
  @Input() legend = null;
  @Input() stacking: OptionsStackingValue = 'normal';

  Highcharts: typeof Highcharts = Highcharts;
  chart!: Highcharts.Chart;
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'column'
    },
    title: {
      text: this.title
    },
    xAxis: {
      // Updated categories to include specific document types and their totals
      categories: this.categories,
      title: {
        text: this.xAxis
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: this.yAxis,
        // align: 'high'
      },
      labels: {
        overflow: 'justify'
      },
      stackLabels: {
        enabled: this.stackLabels
      }
    },
    tooltip: {
      headerFormat: '<b>{point.x}</b><br/>',
      pointFormat: this.pointFormat,
      // Custom formatter to dynamically apply pointFormat and format numbers
      formatter: function () {
        let formattedHeaderFormat = this.series.chart.options.tooltip.headerFormat
          .replace('{point.x}', this.key);  // `this.key` corresponds to the x-axis category

        // Replace point.y and point.total with formatted values
        let formattedPointFormat = this.series.chart.options.tooltip.pointFormat
          .replace('{point.y}', Highcharts.numberFormat(this.point.y, 0, '.', ','))
          .replace('{point.total}', Highcharts.numberFormat(this.point.total, 0, '.', ','))
          .replace('{series.name}', this.series.name);

        return formattedHeaderFormat + formattedPointFormat;
      }
    },
    plotOptions: {
      column: {
        stacking: this.stacking,
        dataLabels: {
          enabled: true,
          color: 'white'
        }
      }
    },
    legend: {
      backgroundColor: '#FFFFFF',
      reversed: true
    },
    credits: {
      enabled: false
    },
    series: []
  }



  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes['series']);
    this.updateChart();
  }

  updateChart() {
    if (this.chart) {

      while (this.chart.series.length) {
        this.chart.series[0].remove(false); // `false` to avoid redrawing after each removal
      }

      // Add the new series
      this.series.forEach(series => {
        this.chart.addSeries(series, false); // `false` to avoid redrawing after each addition
      });

      this.chart.update({
        title: {
          text: this.title
        },
        xAxis: {
          categories: this.categories,
          title: {
            text: this.xAxis || undefined
          }
        },
        yAxis: {
          max: this.yAxisMax || undefined,
          title: {
            text: this.yAxis,
          },
          labels: {
            format: this.yAxisLabelsFormat || undefined
          },
          stackLabels: {
            enabled: this.stackLabels
          }
        },
        tooltip: {
          pointFormat: this.pointFormat
        },
        plotOptions: {
          column: {
            stacking: this.stacking,
            dataLabels: {
              enabled: this.dataLabels,
              format: this.plotFormat || undefined
            }
          }
        },
        legend: this.legend || {},
        // series: this.series
      }, true, true, true);

    } else {

    }
  }


  chartCallback = (chart: Highcharts.Chart) => {
    this.chart = chart;
    this.updateChart(); // Ensure the chart is updated on initialization

  }

}
