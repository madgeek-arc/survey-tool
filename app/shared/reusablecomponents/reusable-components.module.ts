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
import { TreeGraphComponent } from "./charts/tree-graph/tree-graph.component";
import { BubbleChartComponent } from "./charts/bubble-chart/bubble-chart.component";
import { PackedBubbleChartComponent } from "./charts/packed-bubble-chart/packed-bubble-chart.component";
import { AreaChartComponent } from "./charts/area-chart/area-chart-component";
import { StreamGraphComponent } from "./charts/stream-graph/stream-graph.component";
import { FixedTooltipMapComponent } from "./charts/fixed-tooltip-map/fixed-tooltip-map.component";
import { BarChartComponent } from "./charts/bar-chart/bar-chart.component";
import { StackedColumnComponent } from "./charts/stacked-column-chart/stacked-column.component";
import { TreemapComponent } from "./charts/treemap/treemap.component";
import {
  HighchartsCustomHighlightedMapComponent
} from "./charts/custom-highlighted-map/highcharts-custom-highlighted-map.component";

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
    HighchartsCustomHighlightedMapComponent,
    HighchartsBarComponent,
    HighchartsColumnRangesComponent,
    GaugeActivityComponent,
    GaugeSimpleComponent,
    PieChartComponent,
    TreeGraphComponent,
    BubbleChartComponent,
    PackedBubbleChartComponent,
    AreaChartComponent,
    StreamGraphComponent,
    FixedTooltipMapComponent,
    BarChartComponent,
    StackedColumnComponent,
    TreemapComponent
  ],
  exports: [
    SideMenuDashboardComponent,
    ForbiddenPageComponent,
    HighchartsTilemapComponent,
    HighchartsCategoryMapComponent,
    HighchartsCustomHighlightedMapComponent,
    HighchartsBubbleMapComponent,
    HighchartsColorAxisMapComponent,
    HighchartsBarComponent,
    HighchartsColumnRangesComponent,
    GaugeActivityComponent,
    GaugeSimpleComponent,
    PieChartComponent,
    TreeGraphComponent,
    BubbleChartComponent,
    PackedBubbleChartComponent,
    AreaChartComponent,
    StreamGraphComponent,
    FixedTooltipMapComponent,
    BarChartComponent,
    StackedColumnComponent,
    TreemapComponent
  ],
  providers: [],
})

export class ReusableComponentsModule {
}
