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

  pageSize = 10;
  totalPages = 0;
  isPreviousPageDisabled = false;
  isFirstPageDisabled = false;
  isNextPageDisabled = false;
  isLastPageDisabled = false;

  //Paging
  total: number;
  currentPage = 1;
  pageTotal: number;
  pages: number[] = [];
  offset = 2;

  loading = false;

  constructor(private userService: UserService, private surveyService: SurveyService, public route: ActivatedRoute, public router: Router) {
  }

  ngOnInit() {
    this.loading = true;
    this.subscriptions.push(
      this.route.params.subscribe(params => {
        this.id = params['id'];
        this.updateCoordinatorStakeholderParameter(this.id);
        this.subscriptions.push(
          this.surveyService.getSurveyEntries(this.id, this.urlParameters).subscribe(surveyEntries => {
              this.updateSurveyEntriesList(surveyEntries);
            },
            error => {console.log(error)},
            () => {
              this.paginationInit();
              this.loading = false;
            }
          )
        );
      })
    );
    this.subscriptions.push(
      this.userService.currentStakeholder.subscribe(
        next => this.stakeholder = next
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

  updateSurveyEntriesList(searchResults: Paging<SurveyInfo>) {

    // INITIALISATIONS

    this.surveyEntries = searchResults;
    this.surveyEntriesResults = this.surveyEntries.results;

    this.updatePagingURLParametersQuantity(this.pageSize);
    this.currentPage = (searchResults.from / this.pageSize) + 1;
    this.totalPages = Math.ceil(searchResults.total / this.pageSize);
    if (this.currentPage === 1) {
      this.isFirstPageDisabled = true;
      this.isPreviousPageDisabled = true;
    }
    if (this.currentPage === this.totalPages) {
      this.isLastPageDisabled = true;
      this.isNextPageDisabled = true;
    }
  }

  updateCoordinatorStakeholderParameter(id: string) {
    let key: string;
    if (id.substring(0,2) === 'co') {
      key = 'coordinator';
      if (this.urlParameters.find(param => param.key === key)) {
        this.urlParameters.find(param => param.key === key).values = [id];
      } else {
        const parameter: URLParameter = {
          key: 'coordinator',
          values: [id]
        };
        this.urlParameters.push(parameter);
      }
    }
    else {
      key = 'stakeholder';
      if (this.urlParameters.find(param => param.key === key)) {
        this.urlParameters.find(param => param.key === key).values = [id];
      } else {
        const parameter: URLParameter = {
          key: 'stakeholder',
          values: [id]
        };
        this.urlParameters.push(parameter);
      }
    }
  }

  updatePagingURLParameters(from: number) {
    let foundFromCategory = false;
    for (const urlParameter of this.urlParameters) {
      if (urlParameter.key === 'from') {
        foundFromCategory = true;
        urlParameter.values = [];
        urlParameter.values.push(from + '');
        break;
      }
    }
    if (!foundFromCategory) {
      const newFromParameter: URLParameter = {
        key: 'from',
        values: [from + '']
      };
      this.urlParameters.push(newFromParameter);
    }
  }

  updatePagingURLParametersQuantity(quantity: number) {
    let foundQuantityCategory = false;
    for (const urlParameter of this.urlParameters) {
      if (urlParameter.key === 'quantity') {
        foundQuantityCategory = true;
        urlParameter.values = [];
        urlParameter.values.push(quantity + '');
      }
    }
    if (!foundQuantityCategory) {
      const newQuantityParameter: URLParameter = {
        key: 'quantity',
        values: [quantity + '']
      };
      this.urlParameters.push(newQuantityParameter);
    }
  }

  paginationInit() {
    let addToEndCounter = 0;
    let addToStartCounter = 0;
    this.pages = [];
    this.currentPage = (this.surveyEntries.from / this.pageSize) + 1;
    this.pageTotal = Math.ceil(this.surveyEntries.total / this.pageSize);
    for ( let i = (+this.currentPage - this.offset); i < (+this.currentPage + 1 + this.offset); ++i ) {
      if ( i < 1 ) { addToEndCounter++; }
      if ( i > this.pageTotal ) { addToStartCounter++; }
      if ((i >= 1) && (i <= this.pageTotal)) {
        this.pages.push(i);
      }
    }
    for ( let i = 0; i < addToEndCounter; ++i ) {
      if (this.pages.length < this.pageTotal) {
        this.pages.push(this.pages.length + 1);
      }
    }
    for ( let i = 0; i < addToStartCounter; ++i ) {
      if (this.pages[0] > 1) {
        this.pages.unshift(this.pages[0] - 1 );
      }
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    let from: number = (this.currentPage - 1) * this.pageSize
    this.updatePagingURLParameters(from);
    return this.navigateUsingParameters();
  }

  previousPage() {
    // if (this.currentPage > 1) {
      this.currentPage--;
      let from: number = this.surveyEntries.from;
      from -= this.pageSize;
      this.updatePagingURLParameters(from);
      return this.navigateUsingParameters();
    // }
  }

  nextPage() {
    // if (this.currentPage < this.pageTotal) {
      this.currentPage++;
      let from: number = this.surveyEntries.from;
      from += this.pageSize;
      this.updatePagingURLParameters(from);
      return this.navigateUsingParameters();
    // }
  }

  navigateUsingParameters() {
    const map: { [name: string]: string; } = {};
    for (const urlParameter of this.urlParameters) {
      map[urlParameter.key] = urlParameter.values.join(',');
    }
    // console.log(map);
    return this.router.navigate([`/contributions/${this.id}/surveys`, map]);
  }

}
