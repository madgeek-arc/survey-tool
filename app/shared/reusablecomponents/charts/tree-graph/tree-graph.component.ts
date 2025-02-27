import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import * as Highcharts from "highcharts";
import treemap from 'highcharts/modules/treemap';
import treegraph from 'highcharts/modules/treegraph';
import HC_more from 'highcharts/highcharts-more';
import { PointOptionsObject, SeriesOptionsType } from "highcharts";

treemap(Highcharts);
HC_more(Highcharts);
treegraph(Highcharts);


@Component({
  selector: "app-tree-graph",
  template: '<highcharts-chart [Highcharts]="Highcharts" [options]="chartOptions" [callbackFunction]="chartCallback" style="width: 100%; height: 100%; display: block;"></highcharts-chart>',
})


export class TreeGraphComponent implements OnChanges {
  @Input() data: PointOptionsObject[] = [];

  Highcharts: typeof Highcharts = Highcharts;
  chart!: Highcharts.Chart;
  chartOptions: Highcharts.Options = {
    title: {
      text: ''
    },
    credits: {
      enabled: false
    },
    exporting: {
      buttons: {
        contextButton: {
          align: 'left'
        }
      }
    },
    series: [
      {
        type: 'treegraph',
        data: this.data,
        tooltip: {
          pointFormat: '{point.name}',
          linkFormat: {
            disable: true
          }
        },
        marker: {
          symbol: 'rect',
          width: '25%'
        },
        borderRadius: 10,
        dataLabels: {
          format: '{point.name}',
          style: {
            whiteSpace: 'nowrap'
          },
          linkFormat: '', // Remove text form links
        },
        levels: [
          {
            level: 1,
            levelIsConstant: false
          },
          {
            level: 2,
            colorByPoint: true
          },
          {
            level: 3,
            colorVariation: {
              key: 'brightness',
              to: -0.5
            }
          },
          {
            level: 4,
            colorVariation: {
              key: 'brightness',
              to: 0.5
            }
          }
        ]
      } as unknown as Highcharts.SeriesTreegraphOptions
    ]
  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes['data']);
    this.updateChart();
  }

  updateChart() {
    if (this.chart) {
      // console.log(this.data);
      this.chart.update({
        series: [{
          data: this.data
        }] as SeriesOptionsType[]
      }, true, true);
    } else {

    }
  }


  chartCallback = (chart: Highcharts.Chart) => {
    this.chart = chart;
    this.updateChart(); // Ensure the chart is updated on initialization

  }

}
