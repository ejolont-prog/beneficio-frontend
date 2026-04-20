import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard], // Aquí queda el guard listo
    children: [
      /* Aquí irás agregando tus rutas cuando tengas los componentes, ejemplo:
         { path: 'dashboard', component: DashboardComponent },
      */
    ]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
