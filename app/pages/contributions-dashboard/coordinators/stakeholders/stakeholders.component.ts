import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy, inject, signal } from "@angular/core";
import { Paging } from "../../../../../catalogue-ui/domain/paging";
import { Coordinator, Stakeholder } from "../../../../domain/userInfo";
import { StakeholdersService } from "../../../../services/stakeholders.service";
import { URLParameter } from "../../../../domain/url-parameter";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { fromEvent, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, map, takeUntil } from "rxjs/operators";
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { UserService } from "../../../../services/user.service";
import { PageContentComponent } from "../../../../shared/page-content/page-content.component";
import { SidebarMobileToggleComponent } from "../../../../shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { NgClass } from "@angular/common";

declare var UIkit;

@Component({
    selector: 'app-stakeholders',
    templateUrl: 'stakeholders.component.html',
    providers: [StakeholdersService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageContentComponent, SidebarMobileToggleComponent, FormsModule, NgClass, RouterLink, ReactiveFormsModule]
})

export class StakeholdersComponent implements OnInit, OnDestroy {

  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(UntypedFormBuilder);
  private stakeholdersService = inject(StakeholdersService);
  private userService = inject(UserService);

  private _destroyed: Subject<boolean> = new Subject();
  coordinator: Coordinator = null;
  stakeholders = signal<Paging<Stakeholder>>(null);
  urlParameters: URLParameter[] = [];
  searchQuery = signal<string>(null);
  ready = signal(false);
  edit: boolean = false;
  stakeholderForm: UntypedFormGroup = this.fb.group(new Stakeholder());
  allStakeholders: any[] = [];

  // Paging
  pages = signal<number[]>([]);
  offset = 2;
  pageSize = 12;
  totalPages = signal(0);
  currentPage = signal(0);

  selectedView: 'card' | 'table' = 'card';

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
            this.searchQuery.set(urlParameter.values[0]);
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
      res => {this.stakeholders.set(res);},
      error => {console.error(error)},
      () => {
        this.paginationInit();
        this.ready.set(true);
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
        res => {this.stakeholders.set(res);},
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
          res => {this.stakeholders.set(res);},
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
    if (this.currentPage() > 0) {
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
      this.stakeholdersService.getStakeholdersByType(this.coordinator.type, tmpParams).subscribe(
        res => {this.exportToCSV(res.results, ['name', 'id', 'country', 'admins', 'members'], headerLabels, filename);},
        error => {console.error(error);}
      );


    }



}
