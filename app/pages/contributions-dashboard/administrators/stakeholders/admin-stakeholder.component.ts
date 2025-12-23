import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {PageContentComponent} from "../../../../shared/page-content/page-content.component";
import {
  SidebarMobileToggleComponent
} from "../../../../shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {JsonPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {Paging} from "../../../../../catalogue-ui/domain/paging";
import {Administrator, Coordinator, Stakeholder, UserGroup} from "../../../../domain/userInfo";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {URLParameter} from "../../../../domain/url-parameter";
import {StakeholdersService} from "../../../../services/stakeholders.service";
import UIkit from "uikit";
import {debounceTime, distinctUntilChanged, map, takeUntil} from "rxjs/operators";
import {fromEvent, Subject} from "rxjs";
import {UserService} from "../../../../services/user.service";

@Component({
  selector: "admin-stakeholder",
  templateUrl: "admin-stakeholder.component.html",
  standalone: true,
  imports: [
    PageContentComponent,
    SidebarMobileToggleComponent,
    FormsModule,
    NgForOf,
    NgIf,
    NgClass,
    RouterLink,
    ReactiveFormsModule,
  ],
  providers: [StakeholdersService],
})

export class AdminStakeholderComponent implements OnInit, OnDestroy {

  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

  searchQuery: string = null;
  ready: boolean = false;
  stakeholders: Paging<Stakeholder> = null;
  administrator: UserGroup = null;
  urlParameters: URLParameter[] = [];
  edit: boolean = false;
  stakeholderForm: UntypedFormGroup = this.fb.group(new Stakeholder());
  private _destroyed: Subject<boolean> = new Subject();

  // Paging
  pages: number[] = [];
  offset = 2;
  pageSize = 12;
  totalPages = 0;
  currentPage = 0;

  constructor(private router: Router, private fb: UntypedFormBuilder, private stakeholderService: StakeholdersService, private route: ActivatedRoute, private userService: UserService) {
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
      res => {this.stakeholders = res;},
      error => {console.error(error)},
      () => {
        this.paginationInit();
        this.ready = true;
      }
    );
  }

  addStakeholderAdmin(){
    this.stakeholderService.postStakeholderAdmin(this.stakeholderForm.value).subscribe(
      res => {},
      error => {console.error(error)},
      () => {
        UIkit.modal('#modal-center').hide()
        this.stakeholderService.getStakeholdersByType(this.administrator.type, this.urlParameters).subscribe(
          res => {this.stakeholders = res;},
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
          res => {this.stakeholders = res;},
          error => {console.error(error)},
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
    this.stakeholderForm.get('type').setValue(this.administrator.type);

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
