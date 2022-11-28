import {Component} from "@angular/core";
import {environment} from "../../../../../environments/environment";
import {CountryTableData} from "../../../domain/country-table-data";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {DataService} from "../../../services/data.service";
import {DataHandlerService} from "../../../services/data-handler.service";
import {CategorizedAreaData} from "../../../domain/categorizedAreaData";


@Component({
  selector: 'app-mandate',
  templateUrl: 'ncte-mandate.html'
})

export class NCTEMandate {

  private chartsURL = environment.STATS_API_ENDPOINT + 'chart?json=';
  private profileName = environment.profileName;

  tableAbsoluteData: CountryTableData[];
  mapData: CategorizedAreaData;
  loadingAbsoluteTable: boolean = true;

  mandatedStatusPieChartURL: SafeResourceUrl;

  constructor(private dataService: DataService, private dataHandlerService: DataHandlerService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.dataService.getMandatedStatus().subscribe(
      rawData => {
        // console.log('RawData', rawData);
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

    if(!this.mandatedStatusPieChartURL) {
      this.mandatedStatusPieChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"","type":"pie","query":{"name":"eosc.obs.question17.pie","profile":"eosc-obs"}}],"chart":{"type":"line","polar":false,"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0,"zoomType":"xy"},"title":{"style":{"color":"#333333FF","fontSize":"18px"},"text":"Has the country appointed a Mandated Organisation to the EOSC Association?","margin":15,"align":"center"},"subtitle":{"style":{"color":"#666666FF","fontSize":"12px"},"align":"center"},"yAxis":{"title":{"style":{"color":"#666666FF","fontSize":"11px"}},"zoomEnabled":false,"reversedStacks":false},"xAxis":{"title":{"style":{"color":"#666666FF","fontSize":"11px"}},"zoomEnabled":false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":true,"style":{"textOutline":"2px contrast","stroke-width":0,"color":"#000000ff"}}}},"legend":{"layout":"horizontal","align":"center","verticalAlign":"bottom","enabled":true},"credits":{"enabled":false,"href":null},"tooltip":{"style":{}},"colors":["#a9a9a9","#F4A261","#E76F51","#2A9D8F","#910000","#1aadce","#492970","#f28f43","#77a1e5","#c42525","#a6c96a"]}}`));
    }
  }

}
