import { Component, OnInit } from '@angular/core';
import { Router, ActivationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  routeTitle: string;

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events.subscribe(
      event => ((event instanceof ActivationEnd) && this.setRouteTitle(event))
    );
  }
  setRouteTitle(activationEndEvent: ActivationEnd) {
    this.routeTitle = activationEndEvent.snapshot.data.title;
  }
}
