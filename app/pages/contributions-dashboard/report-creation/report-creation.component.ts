import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ReportCreationService } from "../../../services/report-creation.service";
import { ChartsModule } from "../../../../../app/shared/charts/charts.module";
import { EoscReadinessDataService } from "../../../../../app/pages/services/eosc-readiness-data.service";
import { StakeholdersService } from "../../../services/stakeholders.service";
import { WorldMapComponent } from "../../../../../app/shared/charts/world-map/world-map.component";
import { forkJoin } from "rxjs";

interface Chart {
  title: string;
  namedQueries: string[];
  data: any[];
  series: any[];
  type: string;
  order: number;
}

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
    ChartsModule,
    WorldMapComponent
  ],
  providers: [StakeholdersService],
  templateUrl: './report-creation.component.html'
})

export class ReportCreationComponent implements OnInit {
  worldCharts: Highcharts.Chart[] = [];

  year = '2023';
  countriesArray: string[] = [];

  reportCfg: {
    charts: Chart[];
  } = {
    charts: [
      {
        title: 'National policies',
        namedQueries: ['Question22','Question22.1'],
        data: [],
        series: [],
        type: 'mapWithPoints',
        order: 1
      },
      {
        title: 'Participating countries',
        namedQueries: ['Question6'],
        data: [],
        series: [],
        type: 'map',
        order: 2
      },
    ]
  }

  data: object = {
    Question22: '33%',
    'Question22.1': 12 + ' %'
  }

  constructor(private queryData: EoscReadinessDataService, private reportService: ReportCreationService) {}

  ngOnInit() {
    this.reportCfg.charts.forEach(chart => this.loadChart(chart));
  }

  loadChart(chart: Chart) {
    // map each key to its observable
    const calls = chart.namedQueries.map(q =>
      this.queryData.getQuestion(this.year, q)
    );

    // run them all in parallel
    forkJoin(calls).subscribe({
      next: results => {
        // results is an array in the same order as namedQueries
        chart.data = results;
        // Todo: create chart series
        console.log(`Loaded ${chart.title}:`, results);
      },
      error: err => console.error(`Error loading ${chart.title}`, err)
    });
  }

  async generateReport() {
    try {
      console.log(`Processing ${this.worldCharts.length} charts...`);

      // Generate image buffers for all charts
      const chartImages: { [key: string]: ChartImageData } = {};
      const staticImages: { [key: string]: { path: string, width: number, height: number } } = {};

      // Process Highcharts
      for (let i = 0; i < this.worldCharts.length; i++) {
        const chart = this.worldCharts[i];
        console.log(`Converting chart ${i + 1} to image buffer...`);

        const imageBuffer = await this.chartToArrayBuffer(chart, 400, 300);
        chartImages[`chartImage${i + 1}`] = {
          buffer: imageBuffer,
          width: 400,
          height: 300,
          title: `Chart ${i + 1}`
        };
      }

      // Add static images if needed
      staticImages['logoImage'] = { path: 'assets/images/2-2.png', width: 200, height: 300 };

      // Prepare the data report
      const reportData = {
        "Question22": "33%",
        Question22_1: 12 + ' %',
        generatedDate: new Date().toLocaleDateString(),
        totalCharts: this.worldCharts.length
      };

      // Export document with both chart images and static images
      await this.reportService.exportDocWithMultipleImages(reportData, chartImages, staticImages);

      console.log('Report generated successfully!');

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
  onChildChartReady(chart: Highcharts.Chart, chartIndex: number) {
    console.log(`Chart ${chartIndex + 1} ready`);
    if (this.worldCharts[chartIndex]) // Skip if the chart already exists
      return;

    this.worldCharts[chartIndex] = chart;
    // this.chartCounter++;

    // Optional: Add unique identifiers or metadata
    // (chart as any).customId = `chart_${chartIndex + 1}`;
    // (chart as any).customTitle = `World Map ${chartIndex + 1}`;
  }

  // Generate individual chart image (useful for testing)
  async downloadSingleChart(chartIndex: number) {
    if (this.worldCharts[chartIndex]) {
      try {
        const imageBuffer = await this.chartToArrayBuffer(this.worldCharts[chartIndex], 800, 600);

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

}
