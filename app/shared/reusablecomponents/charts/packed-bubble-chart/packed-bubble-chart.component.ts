import { Component, Input, SimpleChanges } from "@angular/core";
import * as Highcharts from 'highcharts';
import { PointOptionsType } from "highcharts";
import { SeriesOptionsType } from "highcharts/highmaps";
// import PackedBubble from 'highcharts/modules/packed-bubble';

// PackedBubble(Highcharts);

@Component({
  selector: "app-packed-bubble-chart",
  template: '<highcharts-chart [Highcharts]="Highcharts" [options]="chartOptions" [callbackFunction]="chartCallback" style="width: 100%; height: 100%; display: block;"></highcharts-chart>',
})

export class PackedBubbleChartComponent {
  @Input() series: SeriesOptionsType[] = []

  Highcharts: typeof Highcharts = Highcharts;
  chart!: Highcharts.Chart;
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'packedbubble',
      height: '100%'
    },
    title: {
      text: 'Open Science by Theme in Europe',
      align: 'left'
    },
    tooltip: {
      useHTML: true,
      pointFormat: '<b>{point.name}:</b> {point.value}'
    },
    plotOptions: {
      packedbubble: {
        minSize: '30%',
        maxSize: '120%',
        // zMin: 0,
        // zMax: 1000,
        layoutAlgorithm: {
          splitSeries: false,
          gravitationalConstant: 0.02
        },
        dataLabels: {
          enabled: true,
          format: '{point.name}',
          filter: {
            property: 'y',
            operator: '>',
            value: 250
          },
          style: {
            color: 'black',
            textOutline: 'none',
            fontWeight: 'normal'
          }
        }
      }
    },
    credits: {
      enabled: false
    },
    series: this.series
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateChart();
  }

  updateChart() {
    if (this.chart) {
      this.chart.update({
        series: this.series
      }, true, true);
    }
  }

  chartCallback = (chart: Highcharts.Chart) => {
    this.chart = chart;
    this.updateChart(); // Ensure the chart is updated on initialization
  };

}
