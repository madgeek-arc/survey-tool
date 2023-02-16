import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {SurveyService} from "../../../services/survey.service";
import {UserService} from "../../../services/user.service";
import {SurveyInfo} from "../../../domain/survey";
import {Stakeholder} from "../../../domain/userInfo";
import {Paging} from "../../../../catalogue-ui/domain/paging";
import {URLParameter} from "../../../../catalogue-ui/domain/url-parameter";
import {Subscriber} from "rxjs";

@Component({
  selector: 'app-coordinator-dashboard',
  templateUrl: './coordinators.component.html'
})

export class CoordinatorsComponent implements OnInit, OnDestroy{

  subscriptions = [];
  urlParameters: URLParameter[] = [];
  stakeholder: Stakeholder = null;

  surveyEntries: Paging<SurveyInfo>;
  surveyEntriesResults: SurveyInfo[];
  id: string = null;
  loading = false;

  // Filters
  selectedStakeholder: string = null;
  selectedSurvey: string = null;
  validationStatus: string = '';
  publishedStatus: string = '';
  order: string = null;

  //Paging
  pageSize = 10;
  total: number;
  currentPage = 1;
  totalPages: number = 0;
  pages: number[] = [];
  offset = 2;

  constructor(private userService: UserService, private surveyService: SurveyService, public route: ActivatedRoute,
              public router: Router) {
  }

  ngOnInit() {
    this.loading = true;
    this.updateURLParameters('orderField', 'modificationDate');
    this.updateURLParameters('order', 'desc');
    this.subscriptions.push(
      this.route.params.subscribe(params => {
        this.subscriptions.push(
          this.route.queryParams.subscribe(
            qParams => {
              this.setUrlParams(qParams);
              this.id = params['id'];
              this.updateCoordinatorStakeholderParameter(this.id);
              this.subscriptions.push(
                this.surveyService.getSurveyEntries(this.id, this.urlParameters).subscribe(surveyEntries => {
                    this.surveyEntries = surveyEntries;
                    this.surveyEntriesResults = this.surveyEntries.results;
                  },
                  error => {console.error(error)},
                  () => {
                    this.paginationInit();
                    this.loading = false;
                  }
                )
              );
            }
          )
        );
      })
    );
    this.subscriptions.push(
      this.userService.currentStakeholder.subscribe(
        next => this.stakeholder = !!next ? next : JSON.parse(sessionStorage.getItem('currentStakeholder'))
      )
    );

  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      if (subscription instanceof Subscriber) {
        subscription.unsubscribe();
      }
    });
  }

  exportToCsv() {
    this.surveyService.exportToCsv(this.surveyEntriesResults[0].surveyId);
  }

  updateCoordinatorStakeholderParameter(id: string) {
    let key: string;
    if (id.substring(0,2) === 'co') {
      key = 'coordinator';
    } else {
      key = 'stakeholder';
    }
    if (this.urlParameters.find(param => param.key === key)) {
      this.urlParameters.find(param => param.key === key).values = [id];
    } else {
      const parameter: URLParameter = {
        key: key,
        values: [id]
      };
      this.urlParameters.push(parameter);
    }
  }

  updateURLParameters(key: string, value: string | string[]) {
    console.log('key: '+key);
    console.log('value: '+value);
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
      console.log('adding new url param');
      const newFromParameter: URLParameter = {
        key: key,
        values: value instanceof Array ? value : [value]
      };
      this.urlParameters.push(newFromParameter);
    }
    console.log(this.urlParameters)
  }

  paginationInit() {
    let addToEndCounter = 0;
    let addToStartCounter = 0;
    this.pages = [];
    this.currentPage = (this.surveyEntries.from / this.pageSize) + 1;
    this.totalPages = Math.ceil(this.surveyEntries.total / this.pageSize);
    for ( let i = (+this.currentPage - this.offset); i < (+this.currentPage + 1 + this.offset); ++i ) {
      if ( i < 1 ) { addToEndCounter++; }
      if ( i > this.totalPages ) { addToStartCounter++; }
      if ((i >= 1) && (i <= this.totalPages)) {
        this.pages.push(i);
      }
    }
    for ( let i = 0; i < addToEndCounter; ++i ) {
      if (this.pages.length < this.totalPages) {
        this.pages.push(this.pages.length + 1);
      }
    }
    for ( let i = 0; i < addToStartCounter; ++i ) {
      if (this.pages[0] > 1) {
        this.pages.unshift(this.pages[0] - 1 );
      }
    }
  }

  filterSelection(key: string, value: string | string[]) {
    this.updateURLParameters(key, value);
    this.updateURLParameters('from', '0');
    return this.navigateUsingParameters();
  }

  goToPage(page: number) {
    this.currentPage = page;
    let from: number = (this.currentPage - 1) * this.pageSize
    this.updateURLParameters('from', from.toString());
    return this.navigateUsingParameters();
  }

  previousPage() {
    // if (this.currentPage > 1) {
    this.currentPage--;
    let from: number = this.surveyEntries.from;
    from -= this.pageSize;
    this.updateURLParameters('from', from.toString());
    return this.navigateUsingParameters();
    // }
  }

  nextPage() {
    // if (this.currentPage < this.pageTotal) {
    this.currentPage++;
    let from: number = this.surveyEntries.from;
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
    return this.router.navigate([`/contributions/${this.id}/surveys`], {queryParams: map});
  }

  setUrlParams(params) {
    this.urlParameters.splice(0, this.urlParameters.length);
    for (const obj in params) {
      if (params.hasOwnProperty(obj)) {
        const urlParameter: URLParameter = {
          key: obj,
          values: params[obj].split(',')
        };
        this.urlParameters.push(urlParameter);
      }
    }
    this.setFilters();
  }

  setFilters() {
    let ordered: boolean = false;
    for (let i = 0; i < this.urlParameters.length; i++) {
      if (this.urlParameters[i].key === 'stakeholderId') {
        this.selectedStakeholder = this.urlParameters[i].values[0];
        continue;
      }
      if (this.urlParameters[i].key === 'surveyId') {
        this.selectedSurvey = this.urlParameters[i].values[0];
        continue;
      }
      if (this.urlParameters[i].key === 'validated') {
        this.validationStatus = this.urlParameters[i].values[0];
        continue;
      }
      if (this.urlParameters[i].key === 'published') {
        this.publishedStatus = this.urlParameters[i].values[0];
        continue;
      }
      if (this.urlParameters[i].key === 'order') {
        ordered = true;
        this.order = this.urlParameters[i].values[0];
      }
    }
    // if (!ordered) {
    //   console.log(this.urlParameters);
    //   let urlParameter: URLParameter = {
    //     key: 'orderField',
    //     values: ['modificationDate']
    //   };
    //   this.urlParameters.push(urlParameter);
    //   console.log(this.urlParameters);
    //   urlParameter.key = 'order'
    //   urlParameter.values = ['desc']
    //   this.urlParameters.push(urlParameter);
    //   console.log(this.urlParameters);
    // }
  }

}
