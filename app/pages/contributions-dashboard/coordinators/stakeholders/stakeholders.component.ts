import {Component, OnInit} from "@angular/core";
import {Paging} from "../../../../../catalogue-ui/domain/paging";
import {Coordinator, Stakeholder} from "../../../../domain/userInfo";
import {StakeholdersService} from "../../../../services/stakeholders.service";

@Component({
  selector: 'app-stakeholders',
  templateUrl: 'stakeholders.component.html',
  providers: [StakeholdersService]
})

export class StakeholdersComponent implements OnInit {

  coordinator: Coordinator = null;
  stakeholders: Paging<Stakeholder> = null;

  constructor(private stakeholdersService: StakeholdersService) {
  }

  ngOnInit() {

    this.coordinator = JSON.parse(sessionStorage.getItem('currentCoordinator'));

    this.stakeholdersService.getStakeholdersByType(this.coordinator.type).subscribe(
      res => {this.stakeholders = res},
      error => {console.error(error)}
    );
  }

}
