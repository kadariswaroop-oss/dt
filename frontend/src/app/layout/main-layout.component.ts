import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  isSidebarOpen = true;
  currentTitle = 'Dashboard';

  readonly navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Breed Recognition', path: '/recognition', icon: '🖼️' },
    { label: 'Breed Information', path: '/breeds', icon: '📚' },
    { label: 'Prediction History', path: '/history', icon: '🕘' },
    { label: 'Analytics', path: '/analytics', icon: '📊' },
    { label: 'About Project', path: '/about', icon: 'ℹ️' },
  ];

  constructor(private readonly router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.currentTitle = this.resolveTitle(this.router.routerState.snapshot.root);
      });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  private resolveTitle(route: ActivatedRouteSnapshot): string {
    const dataTitle = route.data['title'];
    if (dataTitle) {
      return dataTitle;
    }

    if (route.firstChild) {
      return this.resolveTitle(route.firstChild);
    }

    return 'Dashboard';
  }
}
