import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {ForbiddenPageComponent} from './403-forbidden-page.component';
import {SideMenuDashboardComponent} from "../sidemenudashboard/side-menu-dashboard.component";
import {HighchartsChartModule} from "highcharts-angular";
import {HighchartsTilemapComponent} from "./charts/highcharts-tilemap.component";
import {HighchartsCategoryMapComponent} from "./charts/category-map/highcharts-category-map.component";
import {HighchartsBubbleMapComponent} from "./charts/bubble-map/highcharts-bubble-map.component";
import {HighchartsColorAxisMapComponent} from "./charts/color-axis-map/highcharts-color-axis-map.component";
import {HighchartsBarComponent} from "./charts/bar-chart/highcharts-bar.component";
import {GaugeActivityComponent} from "./charts/gauge-activity/gauge-activity.component";
import {GaugeSimpleComponent} from "./charts/gauge-simple/gauge-simple.component";
import {PieChartComponent} from "./charts/pie-chart/pie-chart.component";
import {HighchartsColumnRangesComponent} from "./charts/column-ranges-chart/highcharts-column-ranges.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HighchartsChartModule
  ],
  declarations: [
    SideMenuDashboardComponent,
    ForbiddenPageComponent,
    HighchartsTilemapComponent,
    HighchartsCategoryMapComponent,
    HighchartsBubbleMapComponent,
    HighchartsColorAxisMapComponent,
    HighchartsBarComponent,
    HighchartsColumnRangesComponent,
    GaugeActivityComponent,
    GaugeSimpleComponent,
    PieChartComponent
  ],
  exports: [
    SideMenuDashboardComponent,
    ForbiddenPageComponent,
    HighchartsTilemapComponent,
    HighchartsCategoryMapComponent,
    HighchartsBubbleMapComponent,
    HighchartsColorAxisMapComponent,
    HighchartsBarComponent,
    HighchartsColumnRangesComponent,
    GaugeActivityComponent,
    GaugeSimpleComponent,
    PieChartComponent
  ],
  providers: [],
})

export class ReusableComponentsModule {
}
