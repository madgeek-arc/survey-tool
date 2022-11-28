/**
 * Created by stefania on 20/04/2018.
 */
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'forbidden-page',
    templateUrl: './403-forbidden-page.component.html',
})
export class ForbiddenPageComponent implements OnInit {

  ngOnInit() {
    let body = document.getElementsByTagName('body')[0];
    body.classList.remove("landing");
    body.classList.add("dashboard");
  }
}
