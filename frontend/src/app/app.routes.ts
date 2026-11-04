import { Routes } from '@angular/router';

import { AboutProjectComponent } from './about-project/about-project.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { BreedInfoComponent } from './breed-info/breed-info.component';
import { BreedRecognitionComponent } from './breed-recognition/breed-recognition.component';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { PredictionHistoryComponent } from './prediction-history/prediction-history.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardHomeComponent, data: { title: 'Dashboard' } },
      { path: 'recognition', component: BreedRecognitionComponent, data: { title: 'Breed Recognition' } },
      { path: 'breeds', component: BreedInfoComponent, data: { title: 'Breed Information' } },
      { path: 'history', component: PredictionHistoryComponent, data: { title: 'Prediction History' } },
      { path: 'analytics', component: AnalyticsComponent, data: { title: 'Analytics' } },
      { path: 'about', component: AboutProjectComponent, data: { title: 'About Project' } },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
