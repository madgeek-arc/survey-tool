import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import * as Highcharts from "highcharts";
import TreemapModule from 'highcharts/modules/treemap';

TreemapModule(Highcharts);

@Component({
  selector: 'app-treemap',
  template: `<highcharts-chart [Highcharts]="Highcharts" [options]="chartOptions" [callbackFunction]="chartCallback" style="width: 100%; height: 100%; display: block;"></highcharts-chart>`
})

export class TreemapComponent implements OnChanges {
  @Input() data: Highcharts.PointOptionsObject[] = [];

  Highcharts: typeof Highcharts = Highcharts;
  chart!: Highcharts.Chart;
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'treemap'
    },
    title: {
      text: undefined
    },
    credits: {
      enabled: false
    },
    series: [{
      type: 'treemap',
      name: 'Science fields',
      layoutAlgorithm: 'squarified',
      allowTraversingTree: true,
      dataLabels: {
        enabled: false
      },
      levelIsConstant: false,
      levels: [{
        level: 1,
        dataLabels: {
          enabled: true
        },
        borderWidth: 3
      }],
      data: []
    }] as Highcharts.SeriesTreemapOptions[]
  };

  ngOnChanges(changes: SimpleChanges) {

    if (changes['data']) {
      this.update(this.data);
    }
  }

  update(data: Highcharts.PointOptionsObject[]) {
    // console.log(data);
    // const chart = Highcharts.charts[0];  // Access the first chart instance
    //
    // if (chart && chart.series[0]) {
    //   chart.series[0].setData(data);  // Update the series data
    // }
    this.chartOptions = {
      ...this.chartOptions,
      series: [{
        type: 'treemap',
        name: 'Science fields',
        layoutAlgorithm: 'squarified',
        allowTraversingTree: true,
        dataLabels: {
          enabled: false
        },
        levelIsConstant: false,
        levels: [{
          level: 1,
          dataLabels: {
            enabled: true
          },
          borderWidth: 3
        }],
        data: this.data
      }] as Highcharts.SeriesTreemapOptions[]
    }
  }

  chartCallback = (chart: Highcharts.Chart) => {
    this.chart = chart;
  };
}
