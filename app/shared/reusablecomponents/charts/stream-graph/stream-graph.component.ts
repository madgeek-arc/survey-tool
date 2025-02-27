import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import * as Highcharts from "highcharts";
import { SeriesOptionsType } from "highcharts";
import HighchartsStock from 'highcharts/modules/stock';
import More from 'highcharts/highcharts-more';
import Streamgraph from 'highcharts/modules/streamgraph';

More(Highcharts);
Streamgraph(Highcharts);
HighchartsStock(Highcharts);

export class StreamData {
  name: string | null = null;
  data: number[][] = [];
}

@Component({
  selector: "app-stream-graph",
  template: '<highcharts-chart [Highcharts]="Highcharts" [options]="chartOptions" [callbackFunction]="chartCallback" style="width: 100%; height: 100%; display: block;"></highcharts-chart>'
})

export class StreamGraphComponent implements OnChanges {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() data: StreamData[] = [];
  @Input() categories: string[] = [];

  Highcharts: typeof Highcharts = Highcharts;
  chart!: Highcharts.Chart;
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'streamgraph',
      marginBottom: 30,
      // zoomType: 'x'
    },
    navigator: {
      enabled: false // Enable the navigator for a resizable scrollbar
    },
    scrollbar: {
      enabled: false,
    },
    title: {
      text: this.title,
    },
    subtitle: {
      text: this.subtitle
    },
    credits: {
      enabled: false
    },
    xAxis: {
      // type: 'datetime',
      // min: this.data[0]?.data[this.data[0].data.length-10][0],
      // max: this.data[0]?.data[this.data[0].data.length-1][0],
      crosshair: true,
      // categories: this.categories
      categories: [
        '2014',
        '2015',
        '2016',
        '2017',
        '2018',
        '2019',
        '2020',
        '2021',
        '2022',
        '2023',
      ],
      labels: {
        align: 'left',
        reserveSpace: false,
        rotation: 270
      },
      lineWidth: 0,
      margin: 20,
      tickWidth: 0
    },
    yAxis: {
      visible: false,
      startOnTick: false,
      endOnTick: false
    },
    legend: {
      enabled: true,
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'top',
      // x: 0,  // Adjust horizontal position (negative to move left, positive to move right)
      y: 30,    // Adjust vertical position (negative to move up, positive to move down)
    },
    tooltip: {
      // headerFormat: '<b>{point.key}</b><br>', // Default header format (could be customized)
      // pointFormat: '<b>Value:</b> {point.y:.2f}',
      // formatter: function() {
      //   const point = this.point;
      //   return `<b>${point.series.name}</b><br>Date: ${Highcharts.dateFormat('%A, %b %e, %Y', point.x)}<br>Value: ${point.y?.toFixed(2)}`;
      // }
    },
    plotOptions: {
      series: {
        label: {
          minFontSize: 5,
          maxFontSize: 15,
          style: {
            color: 'rgba(255,255,255,0.75)'
          }
        },
        accessibility: {
          exposeAsGroupOnly: true
        }
      }
    },
    // series: []
    series: [
      {
        type: 'streamgraph',
        name: 'Open Access',
        data: [10, 11, 4, 3, 6, 35, 38, 42, 49]
      }, {
        type: 'streamgraph',
        name: 'Open Datasets',
        data: [2, 3, 4, 2, 4, 20, 16, 8, 8]
      }, {
        type: 'streamgraph',
        name: 'Open Software',
        data: [1, 2, 5, 3, 7, 20, 15, 10, 4]
      }
    ] as SeriesOptionsType[]
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && changes['data'].currentValue !== changes['data'].previousValue) {
      this.updateChart();
    }
    // if (changes['title'] && changes['title'].currentValue !== changes['title'].previousValue) {
    //   this.chart?.setTitle({ text: this.title });
    // }
    // if (changes['subtitle'] && changes['subtitle'].currentValue !== changes['subtitle'].previousValue) {
    //   this.chart?.setSubtitle({ text: this.subtitle });
    // }
  }

  updateChart() {
    if (this.chart) {
      this.chart.update({
        title: {
          text: this.title,
        },
        subtitle: {
          text: this.subtitle
        },
        // xAxis: {
        //   type: 'datetime',
        //   min: this.data[0]?.data[this.data[0].data.length-10][0],
        //   max: this.data[0]?.data[this.data[0].data.length-1][0],
        // },
        series: [
          {
            type: 'streamgraph',
            name: 'Open Access',
            data: [10, 11, 4, 3, 6, 35, 38, 42, 49]
          }, {
            type: 'streamgraph',
            name: 'Open Datasets',
            data: [2, 3, 4, 2, 4, 20, 16, 8, 8]
          }, {
            type: 'streamgraph',
            name: 'Open Software',
            data: [1, 2, 5, 3, 7, 20, 15, 10, 4]
          }
        ] as SeriesOptionsType[]
        // series: this.data.map(series => ({
        //   type: 'streamgraph',
        //   name: series.name,
        //   data: series.data
        // })) as SeriesOptionsType[]
      }, true, true);
    } else {
      this.chartOptions.series =  [
        {
          type: 'streamgraph',
          name: 'Open Access',
          data: [10, 11, 4, 3, 6, 35, 38, 42, 49]
        }, {
          type: 'streamgraph',
          name: 'Open Datasets',
          data: [2, 3, 4, 2, 4, 20, 16, 8, 8]
        }, {
          type: 'streamgraph',
          name: 'Open Software',
          data: [1, 2, 5, 3, 7, 20, 15, 10, 4]
        }
      ] as SeriesOptionsType[]
      // this.chartOptions.series = this.data.map(series => ({
      //   type: 'streamgraph',
      //   name: series.name,
      //   data: series.data
      // })) as SeriesOptionsType[];
    }
  }

  chartCallback = (chart: Highcharts.Chart) => {
    this.chart = chart;
    this.updateChart(); // Ensure the chart is updated on initialization
  };

}
