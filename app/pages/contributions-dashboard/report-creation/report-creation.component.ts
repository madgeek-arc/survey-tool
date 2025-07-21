import { AfterViewInit, Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ReportCreationService } from "../../../services/report-creation.service";
import { ChartsModule } from "../../../../../app/shared/charts/charts.module";
import { zip } from "rxjs/internal/observable/zip";
import { EoscReadinessDataService } from "../../../../../app/pages/services/eosc-readiness-data.service";
import { StakeholdersService } from "../../../services/stakeholders.service";
import { WorldMapComponent } from "../../../../../app/shared/charts/world-map/world-map.component";

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

export class ReportCreationComponent implements OnInit, AfterViewInit {
  year = '2023';
  countriesArray: string[] = [];

  constructor(private queryData: EoscReadinessDataService, private stakeholdersService: StakeholdersService,
              private reportService: ReportCreationService) {}

  ngOnInit() {
  }


  ngAfterViewInit() {
  }

  getSoftwareData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion(this.year, 'Question22'),
      this.queryData.getQuestion(this.year, 'Question22.1'),
      // this.queryData.getQuestionComment(this.year, 'Question22'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        // this.tableAbsoluteDataArray[1] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        // this.tmpQuestionsDataArray[1] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        // this.participatingCountries[2] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        // this.participatingCountriesPercentage[2] = Math.round((this.participatingCountries[2]/this.countriesArray.length + Number.EPSILON) * 100);
        // for (let i = 0; i < this.tmpQuestionsDataArray[1].series.length; i++) {
        //   this.tmpQuestionsDataArray[1].series[i].data = this.tmpQuestionsDataArray[1].series[i].data.map(code => ({ code }));
        // }
        // this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        // // this.toolTipData[1] = this.dataHandlerService.covertRawDataGetText(res[3]);
        // this.createMapDataFromCategorizationWithDots(1,0);

      },
      error => {console.error(error)},
      () => {}
    );
  }
}
