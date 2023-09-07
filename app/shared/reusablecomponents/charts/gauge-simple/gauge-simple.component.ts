import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import SolidGauge from 'highcharts/modules/solid-gauge';

HighchartsMore(Highcharts);
SolidGauge(Highcharts);
@Component({
  selector: 'simple-gauge',
  template: '<div [id]="chartId"></div>',
  // templateUrl: 'gauge-simple.component.html'
})

export class GaugeSimpleComponent implements AfterViewInit, OnChanges {

  @Input() chartId: string;
  @Input() title: string = null;
  @Input() data: number = 0;

  gaugeChart: Highcharts.Chart;

  ngAfterViewInit() {
    this.createGauge();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data.currentValue != changes.data.previousValue)
      this.gaugeChart?.series[0].points[0].update(this.data);
  }

  createGauge() {
    this.gaugeChart = Highcharts.chart(this.chartId, {
      chart: {
        type: 'solidgauge'
      },
      title: {
        text: this.title
      },
      pane: {
        center: ['50%', '85%'],
        size: '110%',
        startAngle: -90,
        endAngle: 90,
        background: [
          {
            shape: 'solid',
            innerRadius: '60%',
            outerRadius: '100%',
            backgroundColor: Highcharts.color('#008792')
              .setOpacity(0.3)
              .get(),
            borderWidth: 0
          }
        ]
      },
      tooltip: {
        pointFormat: '',
        backgroundColor: 'none',
        shadow: false,
        borderWidth: 0,

      },
      yAxis: {
        min: 0,
        max: 100,
        lineWidth: 0,
        tickPositions: []
      },
      plotOptions: {
        solidgauge: {
          dataLabels: {
            borderWidth: 0,
            enabled: true,
          },
          linecap: 'square',
          stickyTracking: false,
          rounded: false
        }
      },
      series: [
        {
          type: 'solidgauge',
          name: '',
          data: [{
            color: '#008792',
            y: this.data,
          }],
          dataLabels: {
            format: '<div style="text-align:center"><span style="font-size:25px;color:' +
              ('black') + '">{y}%</span><br/></div>'
          },
          tooltip: null
        }
      ]
    });
  }

}
