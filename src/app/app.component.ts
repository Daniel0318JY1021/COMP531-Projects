import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'folkZone';
    isLoggedIn = false;

    constructor(private router: Router) {
        // Check if user is on main or profile page (logged in)
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.isLoggedIn = event.url !== '/' && !event.url.includes('auth');
            }
        });
    }

    isLoggedInRoute(): boolean {
        return this.isLoggedIn;
    }

    logout() {
        this.isLoggedIn = false;
        this.router.navigate(['/']);
    }
}