import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {DataService} from "../../../services/data.service";
import {DataHandlerService} from "../../../services/data-handler.service";
import {StakeholdersService} from "../../../services/stakeholders.service";
import {mapSubtitles} from "../../../domain/mapSubtitles";

import UIkit from "uikit";
import {CountryTableData} from "../../../domain/country-table-data";
import {FundingForEOSCSums} from "../../../domain/funding-for-eosc";
import {CategorizedAreaData, Series} from "../../../domain/categorizedAreaData";
import {zip} from "rxjs/internal/observable/zip";

@Component({
  selector: 'app-investments',
  templateUrl: 'investments.component.html'
})

export class InvestmentsComponent implements OnInit {

  questionsDataArray: any[] = [];
  questionsDataArrayForBarChart: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  countriesArray: string[] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = mapSubtitles;
  fundingForEOSCSums: FundingForEOSCSums;

  constructor(private dataService: DataService, private dataHandlerService: DataHandlerService,
              private route: ActivatedRoute, private stakeholdersService: StakeholdersService) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(
      queryParams => {
        if (queryParams['chart'])
          UIkit.switcher('#investments-tabs').show(queryParams['chart']);
        else
          UIkit.switcher('#investments-tabs').show(0);
      }
    );

    zip(
      this.dataService.getQuestion6(),
      this.dataService.getQuestion7(),
      this.dataService.getQuestion8(),
      this.dataService.getQuestion9(),
      this.dataService.getQuestion10(),
      this.dataService.getQuestion11(),
      this.dataService.getQuestion12(),
      this.dataService.getQuestion13(),
      this.stakeholdersService.getEOSCSBCountries()).subscribe(
      rawData => {
        this.countriesArray = rawData[8];
        this.questionsDataArray[4] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[0]);
        this.questionsDataArrayForBarChart[4] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[0]);
        this.questionsDataArray[5] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[1]);
        this.questionsDataArrayForBarChart[5] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[1]);
        this.questionsDataArray[6] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[2]);
        this.questionsDataArrayForBarChart[6] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[2]);
        this.tableAbsoluteDataArray[7] = this.dataHandlerService.convertRawDataToTableData(rawData[3]);
        this.createMapDataset(0, 7);
        this.tableAbsoluteDataArray[8] = this.dataHandlerService.convertRawDataToTableData(rawData[4]);
        this.createMapDataset(0, 8);
        this.questionsDataArray[9] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[5]);
        this.questionsDataArrayForBarChart[9] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[5]);
        this.questionsDataArray[10] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[6]);
        this.questionsDataArrayForBarChart[10] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[6]);
        this.questionsDataArray[11] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[7]);
        this.questionsDataArrayForBarChart[11] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[7]);

      },
      error => {
        console.log(error);
      }
    );

    this.dataService.getFundingForEOSC().subscribe(
     rawData => {
        this.fundingForEOSCSums = this.dataHandlerService.convertRawDataToFundingForEOSCSumsCustom(rawData);
      },
     error => {
        console.log(error);
      }
    );
  }

  createMapDataset(index: number, mapCount: number) {
    this.mapSubtitles[mapCount] = mapSubtitles[mapCount][index];

    this.questionsDataArray[mapCount] = new CategorizedAreaData();
    this.questionsDataArray[mapCount].series[0] = new Series('Has Policy', false);

    let countryCodeArray = [];
    for (let i = 0; i < this.tableAbsoluteDataArray[mapCount].length; i++) {
      if (this.tableAbsoluteDataArray[mapCount][i].EOSCRelevantPoliciesInPlace[index] === 'true') {
        countryCodeArray.push(this.tableAbsoluteDataArray[mapCount][i].code);
      }
    }
    this.questionsDataArray[mapCount].series[0].data = countryCodeArray;

    this.questionsDataArray[mapCount].series[1] = new Series('No Policy', false);
    this.questionsDataArray[mapCount].series[1].data = this.countriesArray.filter( code => !countryCodeArray.includes(code));

    for (let i = 0; i < this.questionsDataArray[mapCount].series.length; i++) {
      this.questionsDataArray[mapCount].series[i].data = this.questionsDataArray[mapCount].series[i].data.map(code => ({ code }));
    }

  }

}
