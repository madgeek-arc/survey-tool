import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Paging } from "../../../../../catalogue-ui/domain/paging";
import { Coordinator, Stakeholder } from "../../../../domain/userInfo";
import { StakeholdersService } from "../../../../services/stakeholders.service";
import { URLParameter } from "../../../../domain/url-parameter";
import { ActivatedRoute, Router } from "@angular/router";
import { fromEvent, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, map, takeUntil } from "rxjs/operators";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { UserService } from "../../../../services/user.service";

declare var UIkit;

@Component({
  selector: 'app-stakeholders',
  templateUrl: 'stakeholders.component.html',
  providers: [StakeholdersService]
})

export class StakeholdersComponent implements OnInit, OnDestroy {

  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

  private _destroyed: Subject<boolean> = new Subject();
  coordinator: Coordinator = null;
  stakeholders: Paging<Stakeholder> = null;
  urlParameters: URLParameter[] = [];
  searchQuery: string = null;
  ready: boolean = false;
  edit: boolean = false;
  stakeholderForm: UntypedFormGroup = this.fb.group(new Stakeholder());

  // Paging
  pages: number[] = [];
  offset = 2;
  pageSize = 12;
  totalPages = 0;
  currentPage = 0;

  constructor(private router: Router, private route: ActivatedRoute, private fb: UntypedFormBuilder,
              private stakeholdersService: StakeholdersService, private userService: UserService) {
  }

  ngOnInit() {
    this.formInitialization();

    this.route.queryParams.subscribe(params => {
      this.urlParameters.splice(0, this.urlParameters.length);
      for (const obj in params) {
        if (params.hasOwnProperty(obj)) {
          const urlParameter: URLParameter = {
            key: obj,
            values: params[obj].split(',')
          };
          if (urlParameter.key === 'keyword') {
            this.searchQuery = urlParameter.values[0];
          }
          this.urlParameters.push(urlParameter);
        }
      }

      this.updateURLParameters('quantity',this.pageSize);

      this.coordinator = JSON.parse(sessionStorage.getItem('currentCoordinator'));
      if (!this.coordinator) {
        this.route.params.pipe(takeUntil(this._destroyed)).subscribe(
          params => {
            if (params['id'])
              this.stakeholdersService.getCoordinatorById(params['id']).pipe(takeUntil(this._destroyed)).subscribe(
                res => {
                  this.coordinator = res;
                  this.userService.changeCurrentCoordinator(this.coordinator);
                },
                error => console.error(error),
                ()=> {
                  this.getStakeholders();
                }
              );
          }
        )
      } else {
        this.getStakeholders();
      }

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
        this.updateURLParameters('keyword', text);
        this.navigateUsingParameters();
      }
    );

  }

  ngOnDestroy() {
    this._destroyed.next(true);
    this._destroyed.complete();
  }

  formInitialization() {
    // console.log(this.stakeholderForm);
    this.stakeholderForm.get('name').setValidators(Validators.required);
    this.stakeholderForm.get('country').setValidators(Validators.required);
    this.stakeholderForm.get('type').setValidators(Validators.required);
  }

  getStakeholders() {
    this.stakeholdersService.getStakeholdersByType(this.coordinator.type, this.urlParameters)
        .pipe(takeUntil(this._destroyed)).subscribe(
      res => {this.stakeholders = res;},
      error => {console.error(error)},
      () => {
        this.paginationInit();
        this.ready = true;
      }
    );
  }

  addStakeholder() {
    this.stakeholdersService.postStakeholder(this.stakeholderForm.value).subscribe(
      res => {},
      error => {console.error(error)},
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

  /** Modal ---------------------------------------------------------------------------------> **/
  openForEdit(stakeholder: Stakeholder) {
    this.edit = true;
    this.stakeholderForm.patchValue(stakeholder);
  }

  openForAdd() {
    this.edit = false;
    this.stakeholderForm.reset();
    this.stakeholderForm.get('type').setValue(this.coordinator.type);
  }
  /** <--------------------------------------------------------------------------------- Modal **/


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
