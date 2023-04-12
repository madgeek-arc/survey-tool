import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {Paging} from "../../../../../catalogue-ui/domain/paging";
import {Coordinator, Stakeholder} from "../../../../domain/userInfo";
import {StakeholdersService} from "../../../../services/stakeholders.service";
import {URLParameter} from "../../../../../catalogue-ui/domain/url-parameter";
import {ActivatedRoute, Router} from "@angular/router";
import {fromEvent} from "rxjs";
import {debounceTime, distinctUntilChanged, map} from "rxjs/operators";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

declare var UIkit;

@Component({
  selector: 'app-stakeholders',
  templateUrl: 'stakeholders.component.html',
  providers: [StakeholdersService]
})

export class StakeholdersComponent implements OnInit {

  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

  coordinator: Coordinator = null;
  stakeholders: Paging<Stakeholder> = null;
  urlParameters: URLParameter[] = [];
  searchQuery: string = null;
  ready: boolean = false;
  edit: boolean = false;
  stakeholderForm: FormGroup = this.fb.group(new Stakeholder());

  // Paging
  pages: number[] = [];
  offset = 2;
  pageSize = 12;
  totalPages = 0;
  currentPage = 0;

  constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder,
              private stakeholdersService: StakeholdersService) {
  }

  ngOnInit() {

    this.coordinator = JSON.parse(sessionStorage.getItem('currentCoordinator'));
    this.formInitialization();

    this.route.queryParams.subscribe(params => {
      this.urlParameters.splice(0, this.urlParameters.length);
      for (const obj in params) {
        if (params.hasOwnProperty(obj)) {
          const urlParameter: URLParameter = {
            key: obj,
            values: params[obj].split(',')
          };
          if (urlParameter.key === 'query') {
            this.searchQuery = urlParameter.values[0];
          }
          this.urlParameters.push(urlParameter);
        }
      }

      this.updateURLParameters('quantity',this.pageSize);

      this.stakeholdersService.getStakeholdersByType(this.coordinator.type, this.urlParameters).subscribe(
        res => {this.stakeholders = res;},
        error => {console.error(error)},
        () => {
          this.paginationInit();
          this.ready = true;
        }
      );
    });

    fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
      map((event: any) => { // get value
        return event.target.value;
      })
      // , filter(res => res.length > 2) // if character length greater then 2
      , debounceTime(500) // Time in milliseconds between key events
      , distinctUntilChanged() // If previous query is different from current
    ).subscribe((text: string) => {
        this.updateURLParameters('from', 0);
        this.updateURLParameters('query', text);
        this.navigateUsingParameters();
      }
    );

  }

  addStakeholder() {
    this.stakeholdersService.postStakeholder(this.stakeholderForm.value).subscribe(
      res => {},
      error => {},
      () => {
        UIkit.modal('#modal-center').hide();
        this.stakeholdersService.getStakeholdersByType(this.coordinator.type, this.urlParameters).subscribe(
        res => {this.stakeholders = res;},
        error => {console.error(error);}
        );
      }
    )
  }

  updateStakeholder() {
    this.stakeholdersService.putStakeholder(this.stakeholderForm.value).subscribe(
      res => {},
      error => {
      },
      () => {
        UIkit.modal('#modal-center').hide();
        this.stakeholdersService.getStakeholdersByType(this.coordinator.type, this.urlParameters).subscribe(
          res => {this.stakeholders = res;},
          error => {console.error(error);}
        );
      }
    )
  }

  openForEdit(stakeholder: Stakeholder) {
    this.edit = true;
    this.stakeholderForm.patchValue(stakeholder);
  }

  openForAdd() {
    this.edit = false;
    this.stakeholderForm.reset();
  }

  formInitialization() {
    this.stakeholderForm.get('name').setValidators(Validators.required);
    this.stakeholderForm.get('country').setValidators(Validators.required);
    this.stakeholderForm.get('type').setValidators(Validators.required);
    this.stakeholderForm.get('type').setValue(this.coordinator.type);
  }


  /** Paging ---------------------------------------------------------------------------------> **/
  paginationInit() {
    let addToEndCounter = 0;
    let addToStartCounter = 0;
    this.totalPages = Math.ceil(this.stakeholders.total/this.pageSize);
    this.currentPage = Math.ceil(this.stakeholders.from/this.pageSize) + 1;
    this.pages = [];
    for (let i = (+this.currentPage - this.offset); i < (+this.currentPage + 1 + this.offset); ++i ) {
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

  goToPage(page: number) {
    this.updateURLParameters('from', (page) * this.pageSize);
    return this.navigateUsingParameters();
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updateURLParameters('from', (this.currentPage-1)*this.pageSize);
      this.navigateUsingParameters();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateURLParameters('from', (this.currentPage-1)*this.pageSize);
      this.navigateUsingParameters();
    }
  }
  /** <--------------------------------------------------------------------------------- Paging **/


  /** Manipulate url params -----------------------------------------------------------------> **/
  updateURLParameters(key, value) {
    for (const urlParameter of this.urlParameters) {
      if (urlParameter.key === key) {
        urlParameter.values = [value];
        return;
      }
    }
    this.urlParameters.push({key: key, values: [value]});
  }

  /** Manipulate url params -----------------------------------------------------------------> **/

  navigateUsingParameters() {
    const map: { [name: string]: string; } = {};
    for (const urlParameter of this.urlParameters) {
      map[urlParameter.key] = urlParameter.values.join(',');
    }
    return this.router.navigate([`/contributions/${this.coordinator.id}/stakeholders/`], {queryParams: map});
  }

}
