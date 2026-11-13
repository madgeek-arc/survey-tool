import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { SurveyService } from "../../../services/survey.service";
import { UserService } from "../../../services/user.service";
import { SurveyInfo } from "../../../domain/survey";
import { Coordinator, Stakeholder, UserInfo } from "../../../domain/userInfo";
import { Paging } from "../../../../catalogue-ui/domain/paging";
import { URLParameter } from "../../../domain/url-parameter";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { FacetValue } from "../../../../catalogue-ui/domain/facet";
import { PageContentComponent } from "../../../shared/page-content/page-content.component";
import { SidebarMobileToggleComponent } from "../../../shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { NgSelectComponent, NgOptionComponent } from "@ng-select/ng-select";
import { FormsModule } from "@angular/forms";
import { NgClass, DatePipe } from "@angular/common";

@Component({
    selector: 'app-coordinator-dashboard',
    templateUrl: './coordinators.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        PageContentComponent,
        SidebarMobileToggleComponent,
        NgSelectComponent,
        FormsModule,
        NgOptionComponent,
        NgClass,
        RouterLink,
        DatePipe
    ]
})

export class CoordinatorsComponent implements OnInit, OnDestroy{

  private _destroyed: Subject<boolean> = new Subject();
  urlParameters: URLParameter[] = [];
  userInfo: UserInfo = null;
  stakeholder = signal<Stakeholder>(null);
  coordinator: Coordinator = null;

  surveyEntries = signal<Paging<SurveyInfo>>(undefined);
  surveyEntriesResults = signal<SurveyInfo[]>(undefined);
  id = signal<string>(null);
  loading = signal(false);

  // Filters
  stakeholderList = signal<FacetValue[]>([]);
  surveys = signal<FacetValue[]>([]);
  selectedStakeholder = signal<string>(null);
  selectedSurvey = signal<string>(null);
  validationStatus = signal('');
  publishedStatus = signal('');
  order = signal<string>(null);

  //Paging
  pageSize = 10;
  total: number;
  currentPage = signal(1);
  totalPages = signal(0);
  pages = signal<number[]>([]);
  offset = 2;

  private userService = inject(UserService);
  private surveyService = inject(SurveyService);
  public route = inject(ActivatedRoute);
  public router = inject(Router);

  ngOnInit() {
    this.loading.set(true);

    this.route.params.pipe(takeUntil(this._destroyed)).subscribe(params => {
      this.route.queryParams.pipe(takeUntil(this._destroyed)).subscribe(
        qParams => {
          this.id.set(params['id']);
          this.setUrlParams(qParams);
          // this.updateCoordinatorStakeholderParameter(this.id);
          this.updateURLParameters('groupId', this.id());
          this.setFilters();
          this.surveyService.getSurveyEntries(this.urlParameters).pipe(takeUntil(this._destroyed)).subscribe(surveyEntries => {
              this.surveyEntries.set(surveyEntries);
              this.surveyEntriesResults.set(surveyEntries.results);
              this.stakeholderList.set(this.getFacet('stakeholderId'));
              this.surveys.set(this.getFacet('surveyId'))
            },
            error => {console.error(error)},
            () => {
              this.paginationInit();
              this.loading.set(false);
            }
          );

          this.userService.getUserObservable().pipe(takeUntil(this._destroyed)).subscribe(
            next => {
              this.userInfo = next;
              if (this.userInfo) {
                this.userInfo.stakeholders.every(sh => {
                  if (sh.id === this.id()) {
                    this.stakeholder.set(sh);
                    this.userService.changeCurrentStakeholder(this.stakeholder());
                    return false;
                  }
                  return true;
                });

                this.userInfo.coordinators.every(co => {
                  if (co.id === this.id()) {
                    this.coordinator = co;
                    this.userService.changeCurrentCoordinator(this.coordinator);
                    return false;
                  }
                  return true;
                });

              }
            }
          );

        }
      );
    });

  }

  ngOnDestroy() {
    this._destroyed.next(true);
    this._destroyed.complete();
  }

  exportToCsv(surveyId: string) {
    this.surveyService.exportToCsv(surveyId);
  }

  // updateCoordinatorStakeholderParameter(id: string) {
  //   let key: string;
  //   if (id.substring(0,2) === 'co') {
  //     key = 'coordinator';
  //   } else {
  //     key = 'stakeholder';
  //   }
  //   if (this.urlParameters.find(param => param.key === key)) {
  //     this.urlParameters.find(param => param.key === key).values = [id];
  //   } else {
  //     const parameter: URLParameter = {
  //       key: key,
  //       values: [id]
  //     };
  //     this.urlParameters.push(parameter);
  //   }
  // }

  updateURLParameters(key: string, value: string | string[]) {
    // console.log('key: '+key);
    // console.log('value: '+value);
    let foundFromCategory = false;
    for (const urlParameter of this.urlParameters) {
      if (urlParameter.key === key) {
        foundFromCategory = true;
        urlParameter.values = [];
        if (value instanceof Array) {
          if (value.length === 0)
            this.urlParameters.splice(this.urlParameters.indexOf(urlParameter), 1);
          else
            urlParameter.values = value;
        } else {
          if (value === '' || value === null)
            this.urlParameters.splice(this.urlParameters.indexOf(urlParameter), 1);
          else
            urlParameter.values.push(value);
        }
        break;
      }
    }
    if (!foundFromCategory) {
      if (value === null || value === '' || value?.length === 0) {
        return;
      }
      const newFromParameter: URLParameter = {
        key: key,
        values: value instanceof Array ? value : [value]
      };
      this.urlParameters.push(newFromParameter);
    }
  }

  paginationInit() {
    let addToEndCounter = 0;
    let addToStartCounter = 0;
    const pages: number[] = [];
    const currentPage = (this.surveyEntries().from / this.pageSize) + 1;
    const totalPages = Math.ceil(this.surveyEntries().total / this.pageSize);
    for ( let i = (+currentPage - this.offset); i < (+currentPage + 1 + this.offset); ++i ) {
      if ( i < 1 ) { addToEndCounter++; }
      if ( i > totalPages ) { addToStartCounter++; }
      if ((i >= 1) && (i <= totalPages)) {
        pages.push(i);
      }
    }
    for ( let i = 0; i < addToEndCounter; ++i ) {
      if (pages.length < totalPages) {
        pages.push(pages.length + 1);
      }
    }
    for ( let i = 0; i < addToStartCounter; ++i ) {
      if (pages[0] > 1) {
        pages.unshift(pages[0] - 1 );
      }
    }
    this.currentPage.set(currentPage);
    this.totalPages.set(totalPages);
    this.pages.set(pages);
  }

  filterSelection(key: string, value: string | string[]) {
    this.updateURLParameters(key, value);
    this.updateURLParameters('from', '0');
    return this.navigateUsingParameters();
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    let from: number = (this.currentPage() - 1) * this.pageSize
    this.updateURLParameters('from', from.toString());
    return this.navigateUsingParameters();
  }

  previousPage() {
    // if (this.currentPage() > 1) {
    this.currentPage.update(page => page - 1);
    let from: number = this.surveyEntries().from;
    from -= this.pageSize;
    this.updateURLParameters('from', from.toString());
    return this.navigateUsingParameters();
    // }
  }

  nextPage() {
    // if (this.currentPage() < this.pageTotal) {
    this.currentPage.update(page => page + 1);
    let from: number = this.surveyEntries().from;
    from += this.pageSize;
    this.updateURLParameters('from', from.toString());
    return this.navigateUsingParameters();
    // }
  }

  navigateUsingParameters() {
    const map: { [name: string]: string; } = {};
    for (const urlParameter of this.urlParameters) {
      map[urlParameter.key] = urlParameter.values.join(',');
    }
    // console.log(map);
    return this.router.navigate([`/contributions/${this.id()}/surveys`], {queryParams: map});
  }

  setUrlParams(params) {
    let foundOrder = false;
    this.urlParameters.splice(0, this.urlParameters.length);
    for (const obj in params) {
      // console.log(obj);
      if (params.hasOwnProperty(obj)) {
        if (obj === 'order')
          foundOrder = true;
        const urlParameter: URLParameter = {
          key: obj,
          values: params[obj].split(',')
        };
        this.urlParameters.push(urlParameter);
      }
    }
    if (!foundOrder) {
      this.updateURLParameters('sort', 'modificationDate');
      this.updateURLParameters('order', 'desc');
    }

    this.setFilters();
  }

  setFilters() {
    let ordered: boolean = false;
    for (let i = 0; i < this.urlParameters.length; i++) {
      if (this.urlParameters[i].key === 'stakeholderId') {
        this.selectedStakeholder.set(this.urlParameters[i].values[0]);
        continue;
      }
      if (this.urlParameters[i].key === 'surveyId') {
        this.selectedSurvey.set(this.urlParameters[i].values[0]);
        continue;
      }
      if (this.urlParameters[i].key === 'validated') {
        this.validationStatus.set(this.urlParameters[i].values[0]);
        continue;
      }
      if (this.urlParameters[i].key === 'published') {
        this.publishedStatus.set(this.urlParameters[i].values[0]);
        continue;
      }
      if (this.urlParameters[i].key === 'order') {
        ordered = true;
        this.order.set(this.urlParameters[i].values[0]);
      }
    }
  }

  getFacet(field: string) {
    for (let i = 0; i < this.surveyEntries().facets.length; i++) {
      if (this.surveyEntries().facets[i].field === field) {
        return this.surveyEntries().facets[i].values;
      }
    }
    return null
  }

}
