import {AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild} from "@angular/core";
import * as Highcharts from "highcharts";
import HC_exporting from 'highcharts/modules/exporting';
import HC_ExportingOffline from 'highcharts/modules/offline-exporting';
import {SeriesMapDataOptions, SeriesOptionsType} from "highcharts/highmaps";
import {Options, XrangePointOptionsObject} from "highcharts";

HC_exporting(Highcharts);
HC_ExportingOffline(Highcharts);

@Component({
  selector: 'app-bar-chart',
  templateUrl: './highcharts-bar.component.html'
})

export class HighchartsBarComponent implements OnChanges{

  @Input() mapData: (number | SeriesMapDataOptions | [string, number])[] = [];
  @Input() title: string = null;

  @ViewChild('chart') componentRef;
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {}
  chartRef;
  updateFlag;
  ready = false;

  ngOnChanges(changes: SimpleChanges) {
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
        backgroundColor: 'rgba(0,0,0,0)'
      },
      title: {
        text: this.title,
      },
      subtitle: {
        text: '(in millions of Euro)',
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
        headerFormat: `<div>Country: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y} M</div>`,
        shared: true,
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
