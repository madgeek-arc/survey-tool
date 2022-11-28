import {Component, OnInit} from "@angular/core";
import {DataService} from "../../../services/data.service";
import {CountryTableData} from "../../../domain/country-table-data";
import {DataHandlerService} from "../../../services/data-handler.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-ncte-monitoring',
  templateUrl: './ncte-monitoring.component.html'
})

export class NCTEMonitoringComponent implements OnInit {

  private chartsURL = environment.STATS_API_ENDPOINT + 'chart?json=';
  private profileName = environment.profileName;

  // tableAbsoluteData: CountryTableData[];
  // loadingAbsoluteTable: boolean = true;
  //
  // totalFundingForEOSC: string = null;
  //
  // financialContrToEOSCPieChartURL: SafeResourceUrl;

  constructor(private dataService: DataService, private dataHandlerService: DataHandlerService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    // this.dataService.getFinancialContrToEOSCLinkedToPolicies().subscribe(
    //   rawData => {
    //     // console.log('RawData', rawData);
    //     this.tableAbsoluteData = this.dataHandlerService.convertRawDataToTableData(rawData);
    //     this.loadingAbsoluteTable = false;
    //   }, error => {
    //     console.log(error);
    //     this.loadingAbsoluteTable = false;
    //   }
    // );
    //
    // this.dataService.getFundingForEOSCSums().subscribe(
    //   rawData => {
    //     console.log('RawData', rawData);
    //     this.totalFundingForEOSC = this.dataHandlerService.convertRawDataToNumber(rawData);
    //   }, error => {
    //     console.log(error);
    //   }
    // );
    //
    // if(!this.financialContrToEOSCPieChartURL) {
    //   this.financialContrToEOSCPieChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"","type":"pie","query":{"name":"eosc.obs.question5.pie","profile":"eosc-obs"}}],"chart":{"type":"line","polar":false,"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0,"zoomType":"xy"},"title":{"style":{"color":"#333333FF","fontSize":"18px"},"text":"Countries with dedicated financial contributions to the EOSC linked to the policies","margin":15,"align":"center"},"subtitle":{"style":{"color":"#666666FF","fontSize":"12px"},"align":"center"},"yAxis":{"title":{"style":{"color":"#666666FF","fontSize":"11px"}},"zoomEnabled":false,"reversedStacks":false},"xAxis":{"title":{"style":{"color":"#666666FF","fontSize":"11px"}},"zoomEnabled":false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":true,"style":{"textOutline":"2px contrast","stroke-width":0,"color":"#000000ff"}}}},"legend":{"layout":"horizontal","align":"center","verticalAlign":"bottom","enabled":true},"credits":{"enabled":false,"href":null},"tooltip":{"style":{}}}}`));
    // }
  }
}
