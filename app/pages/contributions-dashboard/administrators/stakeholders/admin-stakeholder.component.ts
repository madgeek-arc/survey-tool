import {Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy, inject, signal} from "@angular/core";
import {PageContentComponent} from "../../../../shared/page-content/page-content.component";
import {
  SidebarMobileToggleComponent
} from "../../../../shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {NgSelectModule} from "@ng-select/ng-select";
import {Paging} from "../../../../../catalogue-ui/domain/paging";
import {Administrator, Coordinator, Stakeholder, UserGroup} from "../../../../domain/userInfo";
import {ActivatedRoute, Router} from "@angular/router";
import {URLParameter} from "../../../../domain/url-parameter";
import {StakeholdersService} from "../../../../services/stakeholders.service";
import UIkit from "uikit";
import {debounceTime, distinctUntilChanged, map, takeUntil} from "rxjs/operators";
import {fromEvent, Subject} from "rxjs";
import {UserService} from "../../../../services/user.service";
import {
  STAKEHOLDER_MANAGERS_DRAWER_ID,
  StakeholderManagersDrawerComponent
} from "../../coordinators/stakeholders/managers-drawer/stakeholder-managers-drawer.component";
import { AvatarStackComponent } from "../../coordinators/stakeholders/avatar-stack/avatar-stack.component";
import {
  ActiveFilter, CountryOption, StakeholderRow, stakeholderActiveFilters, stakeholderFilterOptions, toStakeholderRows
} from "../../coordinators/stakeholders/stakeholder-list.utils";

@Component({
  selector: "admin-stakeholder",
  templateUrl: "admin-stakeholder.component.html",
  standalone: true,
  imports: [
    PageContentComponent,
    SidebarMobileToggleComponent,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    StakeholderManagersDrawerComponent,
    AvatarStackComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StakeholdersService],
})

export class AdminStakeholderComponent implements OnInit, OnDestroy {

  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

  private router = inject(Router);
  private fb = inject(UntypedFormBuilder);
  private stakeholderService = inject(StakeholdersService);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  searchQuery = signal<string>(null);
  ready = signal(false);
  stakeholders = signal<Paging<Stakeholder>>(null);
  administrator: UserGroup = null;
  urlParameters: URLParameter[] = [];
  edit = signal(false);
  stakeholderForm: UntypedFormGroup = this.fb.group(new Stakeholder());
  private _destroyed: Subject<boolean> = new Subject();
  rows = signal<StakeholderRow[]>([]);

  // Filters
  typeOptions = signal<string[]>([]);
  countryOptions = signal<CountryOption[]>([]);
  selectedType = signal<string>(null);
  selectedCountry = signal<string>(null);
  order = signal<string>(null);
  activeFilters = signal<ActiveFilter[]>([]);
  readonly selectedView = signal<'card' | 'table'>('card');

  // Paging
  pages = signal<number[]>([]);
  offset = 2;
  pageSize = 12;
  totalPages = signal(0);
  currentPage = signal(0);

  ngOnInit() {
    this.formInitialization();

    this.route.queryParams.subscribe(params => {
      this.urlParameters.splice(0, this.urlParameters.length);
      this.searchQuery.set(null);
      this.selectedType.set(null);
      this.selectedCountry.set(null);
      this.order.set(null);
      for (const obj in params) {
        if (params.hasOwnProperty(obj)) {
          const urlParameter: URLParameter = {
            key: obj,
            values: params[obj].split(',')
          };
          if (urlParameter.key === 'keyword') {
            this.searchQuery.set(urlParameter.values[0]);
          }
          if (urlParameter.key === 'subType') {
            this.selectedType.set(urlParameter.values[0]);
          }
          if (urlParameter.key === 'country') {
            this.selectedCountry.set(urlParameter.values[0]);
          }
          if (urlParameter.key === 'order') {
            this.order.set(urlParameter.values[0]);
          }
          this.urlParameters.push(urlParameter);
        }
      }

      this.updateURLParameters('quantity',this.pageSize);

      this.administrator = JSON.parse(sessionStorage.getItem('currentAdministrator'));
      if (!this.administrator) {
        this.route.params.pipe(takeUntil(this._destroyed)).subscribe(
          params => {
            if (params['id'])
              this.stakeholderService.getAdministratorById(params['id']).pipe(takeUntil(this._destroyed)).subscribe(
                res => {
                  this.administrator = res;
                  this.userService.changeCurrentAdministrator(this.administrator);
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
    this.stakeholderService.getStakeholdersByType(this.administrator.type, this.urlParameters)
      .pipe(takeUntil(this._destroyed)).subscribe(
      res => {this.setStakeholders(res);},
      error => {console.error(error)},
      () => {
        this.paginationInit();
        this.ready.set(true);
      }
    );
  }

  setStakeholders(res: Paging<Stakeholder>) {
    this.stakeholders.set(res);
    this.rows.set(toStakeholderRows(res));
    const {typeOptions, countryOptions} = stakeholderFilterOptions(res, this.typeOptions(), this.countryOptions());
    this.typeOptions.set(typeOptions);
    this.countryOptions.set(countryOptions);
    this.activeFilters.set(stakeholderActiveFilters(this.selectedType(), this.selectedCountry()));
  }

  filterSelection(key: string, value: string) {
    this.updateURLParameters(key, value);
    this.updateURLParameters('from', 0);
    return this.navigateUsingParameters();
  }

  clearFilters() {
    for (const key of ['subType', 'country', 'keyword']) {
      this.updateURLParameters(key, null);
    }
    this.updateURLParameters('from', 0);
    return this.navigateUsingParameters();
  }

  addStakeholderAdmin(){
    this.stakeholderService.postStakeholderAdmin(this.stakeholderForm.value).subscribe(
      res => {},
      error => {console.error(error)},
      () => {
        UIkit.modal('#modal-center').hide()
        this.stakeholderService.getStakeholdersByType(this.administrator.type, this.urlParameters).subscribe(
          res => {this.setStakeholders(res);},
          error => {console.error(error)},
        )
      }
    )
  }

  updateStakeholderAdmin(){
    this.stakeholderService.putStakeholderAdmin(this.stakeholderForm.value).subscribe(
      res => {},
      error => {
      },
      () => {
        UIkit.modal('#modal-center').hide();
        this.stakeholderService.getStakeholdersByType(this.administrator.type, this.urlParameters).subscribe(
          res => {this.setStakeholders(res);},
          error => {console.error(error)},
        );
      }
    )
  }

  /** Modal ---------------------------------------------------------------------------------> **/
  readonly managersFor = signal<Stakeholder | null>(null);

  openManagers(stakeholder: Stakeholder) {
    this.managersFor.set(stakeholder);
    UIkit.offcanvas('#' + STAKEHOLDER_MANAGERS_DRAWER_ID).show();
  }

  openForEdit(stakeholder: Stakeholder) {
    this.edit.set(true);
    this.stakeholderForm.patchValue(stakeholder);
  }

  openForAdd() {
    this.edit.set(false);
    this.stakeholderForm.reset();
    this.stakeholderForm.get('type').setValue(this.administrator.type);

  }
  /** <--------------------------------------------------------------------------------- Modal **/



  /** Paging ---------------------------------------------------------------------------------> **/
  paginationInit() {
    let addToEndCounter = 0;
    let addToStartCounter = 0;
    const totalPages = Math.ceil(this.stakeholders().total/this.pageSize);
    const currentPage = Math.ceil(this.stakeholders().from/this.pageSize) + 1;
    const pages: number[] = [];
    for (let i = (+currentPage - this.offset); i < (+currentPage + 1 + this.offset); ++i ) {
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
    this.totalPages.set(totalPages);
    this.currentPage.set(currentPage);
    this.pages.set(pages);
  }

  goToPage(page: number) {
    this.updateURLParameters('from', (page) * this.pageSize);
    return this.navigateUsingParameters();
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      this.updateURLParameters('from', (this.currentPage()-1)*this.pageSize);
      this.navigateUsingParameters();
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      this.updateURLParameters('from', (this.currentPage()-1)*this.pageSize);
      this.navigateUsingParameters();
    }
  }
  /** <--------------------------------------------------------------------------------- Paging **/

  /** Manipulate url params -----------------------------------------------------------------> **/
  updateURLParameters(key: string, value: string | number | null) {
    const index = this.urlParameters.findIndex(param => param.key === key);
    if (value === null || value === undefined || value === '') {
      if (index > -1)
        this.urlParameters.splice(index, 1);
      return;
    }
    if (index > -1)
      this.urlParameters[index].values = [String(value)];
    else
      this.urlParameters.push({key: key, values: [String(value)]});
  }

  /** Manipulate url params -----------------------------------------------------------------> **/

  navigateUsingParameters() {
    const map: { [name: string]: string; } = {};
    for (const urlParameter of this.urlParameters) {
      map[urlParameter.key] = urlParameter.values.join(',');
    }
    return this.router.navigate([`/contributions/${this.administrator.id}/stakeholders-admin/`], {queryParams: map});
  }

  /** CSV Method */

  exportToCSV(
    data: any[],
    headers: string[],
    headerLabels?: string[],
    filename: string = 'stakeholders.csv',
  ): void {
    if (!data || !data.length) return;

    const csvRows: string[] = [];

    const headerRow = (headerLabels && headerLabels.length === headers.length
        ? headerLabels
        : headers
    ).map(header => `"${header}"`).join(',');
    csvRows.push(headerRow);

    for (const row of data) {
      const values = headers.map(header => {
        const rawValue = this.getNestedValue(row, header);
        const stringValue = rawValue !== null && rawValue !== undefined ? String(rawValue) : '';
        const escaped = stringValue.replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);

  }

  exportData(): void {
    const headerLabels = ['Name', 'ID', 'Country', 'Managers', 'Members'];
    const filename = 'stakeholders.csv';


    const tmpParams: URLParameter[] = [{key:'from', values:['0']}, {key:'quantity', values:['1000']}];
    this.stakeholderService.getStakeholdersByType(this.administrator.type, tmpParams).subscribe(
      res => {this.exportToCSV(res.results, ['name', 'id', 'country', 'admins', 'members'], headerLabels, filename);},
      error => {console.error(error);}
    );


  }
}
