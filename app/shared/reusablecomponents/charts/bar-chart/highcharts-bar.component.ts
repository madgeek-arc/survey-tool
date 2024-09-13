import {Component, Input, OnChanges, SimpleChanges, ViewChild} from "@angular/core";
import * as Highcharts from "highcharts";
import HC_exporting from 'highcharts/modules/exporting';
import HC_ExportingOffline from 'highcharts/modules/offline-exporting';
import {SeriesMapDataOptions} from "highcharts/highmaps";

HC_exporting(Highcharts);
HC_ExportingOffline(Highcharts);
let componentContext;

@Component({
  selector: 'app-bar-chart',
  templateUrl: './highcharts-bar.component.html',
  styles: ['#container {display: block; width: 100%; height: 100%; }']
})

export class HighchartsBarComponent implements OnChanges{

  @ViewChild('chart') componentRef;

  @Input() mapData: (number | SeriesMapDataOptions | [string, number])[] = [];
  @Input() title: string = null;
  @Input() subTitle: string = null;
  @Input() caption: string = null;
  @Input() dataSeriesSuffix: string = null;

  backgroundColor: string = '#ffffff';
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {}
  chartRef: Highcharts.Chart;
  updateFlag: any;
  ready = false;

  ngOnChanges(changes: SimpleChanges) {
    componentContext = this;
    // this.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--medium-grey');
    if (this.mapData?.length > 0) {
      this.mapData = this.mapData.filter((element) => {
        return element[1] > 0;
      });
      this.createChartBar()
      this.ready = true
    }
  }

  private createChartBar(): void {

    this.chartOptions =  {
      chart: {
        type: 'bar',
        backgroundColor: this.backgroundColor
      },
      title: {
        text: this.title,
      },
      subtitle: {
        text: this.subTitle !== null ? this.subTitle : '(in millions of Euro)',
      },
      caption: {
        text: this.caption
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
      yAxis: {
        min: 0,
        title: undefined,
      },
      xAxis: {
        type: 'category',
      },
      tooltip: {
        formatter: function () {
          console.log(componentContext.dataSeriesSuffix);
          return '<b>' + this.point.name + '</b>: ' + this.point.y + ' ' + (componentContext.dataSeriesSuffix !== null ? componentContext.dataSeriesSuffix : ' M');
        },
        // headerFormat: `<div>Country: {point.key}</div>`,
        // pointFormat: `<div>{series.name}: {point.y} M</div>`,
        // shared: true,
        useHTML: true,
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
            style: {
              // textOutline: "2px contrast",
              // stroke-width: 0,
              color: '#000'
            }
          },
        },
      },
      series: [{
        name: 'Amount',
        type: 'bar',
        color: '#008792',
        dataSorting: {
          enabled: true
        },
        data: this.mapData,
      }],
    }
  }

  chartCallback: Highcharts.ChartCallbackFunction = chart => {
    this.chartRef = chart;
  };

}
