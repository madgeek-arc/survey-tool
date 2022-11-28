import {Component, OnInit} from "@angular/core";
import {DataService} from "../../../services/data.service";
import {CountryTableData} from "../../../domain/country-table-data";
import {DataHandlerService} from "../../../services/data-handler.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {environment} from "../../../../../environments/environment";
import {CategorizedAreaData} from "../../../domain/categorizedAreaData";
import {FundingForEOSCSums} from "../../../domain/funding-for-eosc";

@Component({
  selector: 'app-ncte-funding',
  templateUrl: './ncte-funding.component.html'
})

export class NCTEFundingComponent implements OnInit {

  private chartsURL = environment.STATS_API_ENDPOINT + 'chart?json=';
  private profileName = environment.profileName;
  dev = !environment.production;

  tableAbsoluteData: CountryTableData[];
  mapData: CategorizedAreaData;
  bubbleMapSeries: any[] = null;
  loadingAbsoluteTable: boolean = true;

  // fundingForEOSCSums: FundingForEOSCSums;

  financialContrToEOSCPieChartURL: SafeResourceUrl;

  constructor(private dataService: DataService, private dataHandlerService: DataHandlerService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.dataService.getQuestion5().subscribe(
      rawData => {
        this.tableAbsoluteData = this.dataHandlerService.convertRawDataToTableData(rawData);
        this.loadingAbsoluteTable = false;
        this.mapData = this.dataHandlerService.convertRawDataToCategorizedAreasData(rawData);
        for (let i = 0; i < this.mapData.series.length; i++) {
          this.mapData.series[i].data = this.mapData.series[i].data.map(code => ({ code }));
        }

      }, error => {
        console.log(error);
        this.loadingAbsoluteTable = false;
      }
    );

    // this.dataService.getFundingForEOSC().subscribe(
    //   rawData => {
    //     // console.log('RawData', rawData);
    //     // this.fundingForEOSCSums = this.dataHandlerService.convertRawDataToFundingForEOSCSums(rawData);
    //     this.fundingForEOSCSums = this.dataHandlerService.convertRawDataToFundingForEOSCSumsCustom(rawData);
    //   }, error => {
    //     console.log(error);
    //   }
    // )

    this.dataService.getFundingForEOSCBubbleSeries().subscribe(
      rawData => {
        this.bubbleMapSeries = this.dataHandlerService.convertRawDataToBubbleMapSeries(rawData);
      },
      error => {console.log(error)}
    );

    if(!this.financialContrToEOSCPieChartURL) {
      this.financialContrToEOSCPieChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"","type":"pie","query":{"name":"eosc.obs.question5.pie","profile":"${this.profileName}"}}],"chart":{"type":"line","polar":false,"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0,"zoomType":"xy"},"title":{"style":{"color":"#333333FF","fontSize":"18px"},"text":"National contributions to EOSC linked to policies and actions","margin":15,"align":"center"},"subtitle":{"style":{"color":"#666666FF","fontSize":"12px"},"align":"center"},"yAxis":{"title":{"style":{"color":"#666666FF","fontSize":"11px"}},"zoomEnabled":false,"reversedStacks":false},"xAxis":{"title":{"style":{"color":"#666666FF","fontSize":"11px"}},"zoomEnabled":false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":true,"style":{"textOutline":"2px contrast","stroke-width":0,"color":"#000000ff"}}}},"legend":{"layout":"horizontal","align":"center","verticalAlign":"bottom","enabled":true},"credits":{"enabled":false,"href":null},"tooltip":{"style":{}},"colors":["#a9a9a9","#F4A261","#E76F51","#E9C46A","#2A9D8F","#910000","#1aadce","#492970","#f28f43","#77a1e5","#c42525","#a6c96a"]}}`));
    }
  }
}
