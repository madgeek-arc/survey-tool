import { Component, inject, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ReportCreationService } from "../../../services/report-creation.service";
import { EoscReadinessDataService } from "../../../../../app/pages/services/eosc-readiness-data.service";
import { StakeholdersService } from "../../../services/stakeholders.service";
import {
  CustomSeriesMapOptions,
  WorldMapComponent
} from "../../../../../app/shared/charts/report-charts/world-map.component";
import { forkJoin, Observable } from "rxjs";
import { RawData, Row } from "../../../../../app/domain/raw-data";
import * as Highcharts from 'highcharts';
import { SeriesMappointOptions, SeriesPieOptions } from "highcharts";
import { latlong } from "../../../../../app/domain/countries-lat-lon";
import { JsonPipe, NgForOf, NgIf } from "@angular/common";
import { ReportPieChartComponent } from "../../../../../app/shared/charts/report-charts/report-pie-chart.component";
import { Chart, chartsCfg } from "./report-chart.configuration";
import { BarColumnsComponent } from "../../../../../app/shared/charts/report-charts/bar-columns.component";
import { isNumeric } from "../../../utils/utils";


interface ChartImageData {
  buffer: ArrayBuffer;
  width: number;
  height: number;
  title?: string;
}

@Component({
  selector: 'app-report-creation',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    NgForOf,
    WorldMapComponent,
    ReportPieChartComponent,
    JsonPipe,
    BarColumnsComponent
  ],
  providers: [StakeholdersService],
  templateUrl: './report-creation.component.html'
})

export class ReportCreationComponent implements OnInit {
  private queryData = inject(EoscReadinessDataService);
  private reportService =  inject(ReportCreationService);

  charts: Highcharts.Chart[] = [];
  pieCharts: Highcharts.Chart[][] = [];

  years = ['2022', '2023'];

  reportData: Record<string, string> = {};
  chartImages: { [key: string]: ChartImageData } = {};
  staticImages: { [key: string]: { path: string, width: number, height: number } } = {};

  chartsCfg: Chart[] = chartsCfg;

  ngOnInit() {
    // this.pieCharts = this.chartsCfg.map(c => new Array(c.namedQueries.length).fill(null));
    // this.worldCharts = new Array(this.chartsCfg.length).fill(null);
    this.charts = [];
    this.pieCharts = [];
    this.chartsCfg.forEach(chart => this.loadChart(chart));
  }

  loadChart(chart: Chart) {
    // this.worldCharts = [];
    // this.pieCharts = [];
    // map each key to its observable
    let calls: Observable<RawData>[] = [];
    if (chart.type === 'stackedBars') {
      this.years.forEach(year => {
        calls.push(...chart.namedQueries.map(q => this.queryData.getQuestion(year, q)));
      });
    } else {
      calls = chart.namedQueries.map(q =>
        this.queryData.getQuestion(this.years[this.years.length-1], q)
      );
    }


    // run them all in parallel
    forkJoin(calls).subscribe({
      next: results => {
        // results is an array in the same order as namedQueries
        chart.data = results;
        // console.log(`Loaded ${chart.title}:`, results);
        if (chart.type === 'rangeColumns') {
          chart.chartSeries = this.rangeColumnsSeries(results, chart.stats[0]);
          return;
        }

        if (chart.type === 'stackedBars') {
          chart.chartSeries = this.stackedBarSeries(results);
          return;
        }

        chart.chartSeries = this.mapSeries(results); // Create map series

        results.forEach(result => {
          // console.log('Loaded Pie:', result);
          chart.pieSeries.push(this.pieSeries(result, chart.pieSeries.length));
        });

        if (chart.stats) {
          chart.stats.forEach((query, index) => {
            this.reportData[query] = this.countAnswer(chart.data[index]);
          });
        }
      },
      error: err => console.error(`Error loading ${chart.title}`, err)
    });
  }

  async generateReport() {
    const before = this.pieCharts.map(r => r ? r.map(c => Object.keys(c||{}).length) : []);
    console.log('before keysCount: ', before);
    try {
      console.log(`Processing ${(this.charts.length + this.countAllPieSeries())} charts...`);

      // Generate image buffers for all charts
      // const chartImages: { [key: string]: ChartImageData } = {};
      // const staticImages: { [key: string]: { path: string, width: number, height: number } } = {};

      if (Object.keys(this.chartImages).length === 0) {
        // Process Map charts
        for (let i = 0; i < this.charts.length; i++) {
          const chart = this.charts[i];
          console.log(`Converting chart ${i + 1} to image buffer...`);

          const imageBuffer = await this.chartToArrayBuffer(chart, 400, 300);
          this.chartImages[`chartImage${i + 1}`] = {
            buffer: imageBuffer,
            width: 400,
            height: 300,
            title: `Chart ${i + 1}`
          };
        }

        // Process Pie Charts
        const pieChartsSnapshot = this.pieCharts.map(row => row ? row.slice() : []);
        for (let i = 0; i < pieChartsSnapshot.length; i++) {
          const row = pieChartsSnapshot[i];
          if (!row)
            continue;

          for (let j = 0; j < row.length; j++) {
            const pieChart = row[j];
            if (!pieChart) continue; // Skip if no pie chart at this index

            console.log(`Exporting pie chart [${i}, ${j}]...`);
            const buffer = await this.chartToArrayBuffer(pieChart, 400, 300);
            this.chartImages[`pieChartImage_${i}_${j}`] = {
              buffer: buffer,
              width: 400,
              height: 300,
              title: `Pie Chart [${i + 1}, ${j + 1}]`
            };
          }
        }

      }
      if (Object.keys(this.staticImages).length === 0) {
        // Add static images if needed
        this.staticImages['logoImage'] = {path: 'assets/images/2-2.png', width: 200, height: 300};
      }

      // Export document with both chart images and static images
      await this.reportService.exportDocWithMultipleImages(this.reportData, this.chartImages, this.staticImages);

      console.log('Report generated successfully!');

      const after = this.pieCharts.map(r => r ? r.map(c => Object.keys(c||{}).length) : []);
      console.log('after keysCount: ', after);

    } catch (error) {
      console.error('Error generating report:', error);
    }

  }

  // Convert Highcharts instance to ArrayBuffer
  private async chartToArrayBuffer(chart: Highcharts.Chart, width: number, height: number): Promise<ArrayBuffer> {
    try {
      // Get SVG from Highcharts
      const svgString = chart.getSVG({
        // chart: {
        //   backgroundColor: '#ffffff'
        // }
      });

      // Convert SVG to ArrayBuffer using the service helper
      return await this.reportService.svgToArrayBuffer(svgString, width, height);
    } catch (error) {
      console.error('Error converting chart to ArrayBuffer:', error);
      throw error;
    }
  }

  // Handle multiple charts from child components
  onChartReady(chart: Highcharts.Chart, chartIndex: number) {
    console.log(`Chart ${chartIndex + 1} ready`);
    if (this.charts[chartIndex]) // Skip if the chart already exists
      return;

    this.charts[chartIndex] = chart;
  }

  onPieChartReady(chart: Highcharts.Chart, i: number, j: number) {
    console.log(`Pie Chart ready [${i}, ${j}]`);
    if (this.pieCharts[i] && this.pieCharts[i][j])
      return;

    if (!this.pieCharts[i])
      this.pieCharts[i] = [];

    this.pieCharts[i][j] = chart;

  }

  // Generate individual chart image (useful for testing)
  async downloadSingleChart(chartIndex: number) {
    if (this.charts[chartIndex]) {
      try {
        const imageBuffer = await this.chartToArrayBuffer(this.charts[chartIndex], 800, 600);

        // Create a download link for testing
        const blob = new Blob([imageBuffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chart_${chartIndex + 1}.png`;
        link.click();
        URL.revokeObjectURL(url);

        console.log(`Chart ${chartIndex + 1} downloaded successfully`);
      } catch (error) {
        console.error(`Error downloading chart ${chartIndex + 1}:`, error);
      }
    }
  }

  // Trends chart
  stackedBarSeries(data: RawData[]) {
    const seriesOptions: Highcharts.SeriesBarOptions[] = [
      {
        type: 'bar',
        name: 'Mandatory policy',
        color: '#E76F51',
        data: []
      },
      {
        type: 'bar',
        name: 'Non mandatory policy',
        color: '#2A9D8F',
        data: []
      }
    ];

    this.years.forEach((year, index) => {
      let hasPolicy = 0;
      let isMandatory = 0;
      data[index * 2].datasets[0].series.result.forEach(element => {
        if (element.row[1] === 'Yes') {
          hasPolicy++;
        }
      });
      data[index * 2 + 1].datasets[0].series.result.forEach(element => {
        if (element.row[1] === 'Yes') {
          isMandatory++;
        }
      });

      seriesOptions[0].data.push(isMandatory);
      seriesOptions[1].data.push(hasPolicy-isMandatory);

    });

    return seriesOptions;
  }

  rangeColumnsSeries(data: RawData[], query: string): Highcharts.SeriesColumnOptions[] {
    let seriesOptions: Highcharts.SeriesColumnOptions[] = [];
    let series: Highcharts.SeriesColumnOptions = {
      type: 'column',
      name: 'countries',
      data: [],
      showInLegend: false,
      color: '#2A9D8F',
    };

    let responses = data[0].datasets[0].series.result.length; // Double check if this is valid
    let notInvesting = 0;
    const seriesData = [0, 0, 0, 0, 0, 0];

    const investments: {code: string, value: number | null}[] = [];
    data[0].datasets[0].series.result.map((element) => {

      // * 1000 in order to ser value in €K
      return investments.push({
        code: element.row[0],
        value: isNumeric(element.row[1]) ? (parseFloat(element.row[1]) * 1000) : null
      });
    });

    const tmpData = data[1].datasets[0].series.result;
    investments.forEach((element, index) => {
      const researchersInFTEs = this.getResearchersByCountry(element.code, tmpData);
      // console.log('country: ',element.code, ' researchers: ', researchersInFTEs);
      if (researchersInFTEs !== null && element.value !== null)
        investments[index].value = investments[index].value / (researchersInFTEs / 1000);
      else
        investments[index].value = null;

      if (investments[index].value === 0 || investments[index].value === null) {
        notInvesting++;
      } else if (investments[index].value <= 50) {
        seriesData[0]++;
      } else if (investments[index].value <= 100) {
        seriesData[1]++;
      } else if (investments[index].value <= 250) {
        seriesData[2]++;
      } else if (investments[index].value <= 500) {
        seriesData[3]++;
      } else if (investments[index].value <= 1000) {
        seriesData[4]++;
      } else {
        seriesData[5]++;
      }

    });


    let percentage = Math.round((notInvesting / responses + Number.EPSILON) * 100);
    this.reportData[query+'[0]'] = `${percentage}% (${notInvesting}/${responses})`;

    percentage = Math.round((seriesData[0] / responses + Number.EPSILON) * 100);
    this.reportData[query+'[1]'] = `${percentage}% (${seriesData[0]}/${responses})`;

    percentage = Math.round((seriesData[1] / responses + Number.EPSILON) * 100);
    this.reportData[query+'[2]'] = `${percentage}% (${seriesData[1]}/${responses})`;

    percentage = Math.round((seriesData[2] / responses + Number.EPSILON) * 100);
    this.reportData[query+'[3]'] = `${percentage}% (${seriesData[2]}/${responses})`;

    percentage = Math.round((seriesData[3] / responses + Number.EPSILON) * 100);
    this.reportData[query+'[4]'] = `${percentage}% (${seriesData[3]}/${responses})`;

    percentage = Math.round((seriesData[4] / responses + Number.EPSILON) * 100);
    this.reportData[query+'[5]'] = `${percentage}% (${seriesData[4]}/${responses})`;

    percentage = Math.round((seriesData[5] / responses + Number.EPSILON) * 100);
    this.reportData[query+'[6]'] = `${percentage}% (${seriesData[5]}/${responses})`;

    series.data = seriesData;
    seriesOptions.push(series)
    return seriesOptions;
  }

  getResearchersByCountry(countryCode: string, rows: Row[]): number | null {
    if (!countryCode || !Array.isArray(rows)) return null;
    const match = rows.find(r => r && Array.isArray(r.row) && r.row[0] === countryCode);
    if (!match)
      return null;

    const researchers: (number | null) = (isNumeric(match.row[1]) ? parseFloat(match.row[1]) : null);
    if (researchers === 0)
      return null;

    return researchers;
  }

  pieSeries(data: RawData, index: number) {

    let yesCount = 0;
    let noCount = 0;

    data.datasets[0].series.result.forEach(entry => {
      // console.log('Row:', entry.row);
      if (entry.row[1] === 'Yes') yesCount++;
      else if (entry.row[1] === 'No') noCount++;
    });

    let series: SeriesPieOptions[] = [{
      // name: 'Policy',
      type: 'pie',
      data: [
        {
          name: index > 0 ? 'Policy is mandatory' : 'Has policy',
          y: yesCount,
          color: '#137CBD'
        },
        {
          name: index > 0 ? 'Not mandatory policy' : 'Does not have policy',
          y: noCount,
          color: '#EC7A1C'
        }
      ]
    }];

    return series;
  }

  mapSeries(data: RawData[]) {

    let series = [];
    const mapLegendSeries = [
      {
        type: 'map',
        name: 'Has national policy',
        color: '#2A9D8F',
        showInLegend: true,
        data: [], // Keep empty for legend-only
        // visible: false, // Hide from map but show in legend
      },
      {
        type: 'map',
        name: 'Does not have national policy',
        color: '#E76F51',
        showInLegend: true,
        data: [], // Keep empty for legend-only
        // visible: false, // Hide from map but show in legend
      },
      {
        type: 'map',
        name: 'Awaiting data',
        color: '#A9A9A9',
        showInLegend: true,
        data: [], // Keep empty for legend-only
        // visible: false, // Hide from map but show in legend
      }
    ];

    if (data.length >= 1) {
      const tmpSeries: CustomSeriesMapOptions = {
        type: 'map',
        name: 'Countries',
        allAreas: true,
        data: [],
        showInLegend: false,
      }

      let flag1 = false;
      let flag2 = false;
      let flag3 = false;
      data[0].datasets[0].series.result.forEach(element => {
        if (element.row[1] === 'Yes') {
          tmpSeries.data.push({code: element.row[0], value: 0});
          flag1 = true;
        }
        else if (element.row[1] === 'No') {
          tmpSeries.data.push({code: element.row[0], value: 1});
          flag2 = true;
        }
        else {
          tmpSeries.data.push({code: element.row[0], value: 2});
          flag3 = true;
        }
      });

      // Filter out legend series that aren't needed
      const activeLegendSeries = [];
      if (flag1) activeLegendSeries.push(mapLegendSeries[0]);
      if (flag2) activeLegendSeries.push(mapLegendSeries[1]);
      if (flag3) activeLegendSeries.push(mapLegendSeries[2]);

      series.push(...activeLegendSeries);

      series.push(tmpSeries);
    }

    if (data.length === 2) {

      const tmpMandatorySeries: SeriesMappointOptions = {
        type: 'mappoint',
        name: 'Mandatory',
        marker: {
          symbol: 'circle',
        },
        dataLabels: {
          enabled: false,
        },
        color: '#7CFC00',
        data: [],
        showInLegend: true
      }

      const tmpNotMandatorySeries: SeriesMappointOptions = {
        type: 'mappoint',
        name: 'Not Mandatory',
        marker: {
          symbol: 'diamond',
        },
        dataLabels: {
          enabled: false,
        },
        color: '#FFEF00',
        data: [],
        showInLegend: true
      }

      // console.log(data[1].datasets[0].series.result);
      data[1].datasets[0].series.result.forEach(element => {
        if (element.row[1] === 'Yes')
          tmpMandatorySeries.data.push({name: element.row[0], lat: latlong.get(element.row[0]).latitude, lon: latlong.get(element.row[0]).longitude});
        else if (element.row[1] === 'No')
          tmpNotMandatorySeries.data.push({name: element.row[0], lat: latlong.get(element.row[0]).latitude, lon: latlong.get(element.row[0]).longitude});
      });

      if (tmpMandatorySeries.data.length)
        series.push(tmpMandatorySeries);
      if (tmpNotMandatorySeries.data.length)
        series.push(tmpNotMandatorySeries);
    }

    // console.log(series);

    return series;
  }

  countAnswer(data: RawData) {
    let count = 0;
    let total = 0;
    let percentage: number;
    data.datasets[0].series.result.forEach(element => {
      if (element.row[1] !== null && element.row[1].trim() !== '')
        total++;

      if (element.row[1] === 'Yes')
        count++;
    });
    percentage = Math.round((count / total + Number.EPSILON) * 100);

    return `${percentage}% (${count}/${total})`
  }

  countAllPieSeries() {
    return this.chartsCfg.reduce((sum, obj) => sum + obj.namedQueries.length, 0);
  }

}
