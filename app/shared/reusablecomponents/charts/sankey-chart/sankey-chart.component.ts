import { Component, Input, OnChanges } from "@angular/core";
import * as Highcharts from "highcharts";
import { SeriesOptionsType } from "highcharts";
import sankey from 'highcharts/modules/sankey';

sankey(Highcharts);

@Component({
  selector: 'app-sankey-chart',
  template: '<highcharts-chart [Highcharts]="Highcharts" [options]="chartOptions" style="width: 100%; height: 100%; display: block;"></highcharts-chart>'
})

export class SankeyChartComponent implements OnChanges {
  @Input() chartTitle?: string;
  @Input() subTitle?: string;
  @Input() caption?: string;
  @Input() series: SeriesOptionsType[] = [];

  Highcharts: typeof Highcharts = Highcharts;
  chart!: Highcharts.Chart;
  chartOptions: Highcharts.Options = {}

  ngOnChanges() {
    this.updateChart();
  }

  updateChart() {
    this.chartOptions = {
      chart: {
        type: 'sankey',
      },
      title: {
        text: this.chartTitle
      },
      subtitle: {
        text: this.subTitle
      },
      caption: {
        text: this.caption
      },
      series: [{
        keys: ['from', 'to', 'weight'],

        nodes: [
          {
            id: 'Preprint',
            color: '#028691',
            // offset: '-110'
            // offsetHorizontal: -110
          },
          {
            id: 'Gold OA',
            color: '#e4587c',
          },
          {
            id: 'Green OA',
            color: '#fae0d1',
          },
          {
            id: 'Closed Access',
            color: '#515252',
          },
          {
            id: 'Green + Gold OA',
            color: 'pink',
          }
        ],

        data: [
          ['Preprint', 'Gold OA', 500],
          ['Preprint', 'Green OA', 300],
          ['Preprint', 'Closed Access', 200],

          ['Gold OA', 'Green + Gold OA', 200],
          ['Green OA', 'Green + Gold OA', 100],
        ],
        type: 'sankey',
        name: 'Sankey OA Routes'
      }]
    }
  }
}
