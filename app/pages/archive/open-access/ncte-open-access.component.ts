import {Component, OnInit} from "@angular/core";
import {DataService} from "../../../services/data.service";
import {CountryTableData} from "../../../domain/country-table-data";
import {DataHandlerService} from "../../../services/data-handler.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {environment} from "../../../../../environments/environment";
import {StakeholdersService} from "../../../services/stakeholders.service";

@Component({
  selector: 'app-ncte-open-access',
  templateUrl: './ncte-open-access.component.html'
})

export class NCTEOpenAccessComponent implements OnInit {

  private chartsURL = environment.STATS_API_ENDPOINT + 'chart?json=';
  private profileName = environment.profileName;

  tablePercentageData: CountryTableData[];
  loadingPercentageTable: boolean = true;
  //
  // totalFundingForEOSC: string = null;
  //
  // financialContrToEOSCPieChartURL: SafeResourceUrl;

  constructor(private dataService: DataService, private dataHandlerService: DataHandlerService,
              private stakeholdersService: StakeholdersService, private sanitizer: DomSanitizer) {}

  ngOnInit() {

    this.loadingPercentageTable = true;
    this.stakeholdersService.getEOSCSBCountries().subscribe(
      eoscSBCountries => {
        // console.log('EOSC SB Countries', eoscSBCountries);
        this.dataService.getOAPublicationPerCountry().subscribe(
          rawData => {
            this.tablePercentageData = this.dataHandlerService.convertRawDataToPercentageTableData(rawData, eoscSBCountries);
            // console.log('Table data', this.tablePercentageData);
            this.loadingPercentageTable = false;
          }, error => {
            console.log(error);
            this.loadingPercentageTable = false;
          }
        );
      }, error => {
        console.log(error);
      }
    );

  }
}
