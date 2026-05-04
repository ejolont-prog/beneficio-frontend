import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CuentasComponent } from './components/cuentas/cuentas.component';
import {AgricultoresComponent} from "./components/agricultores/agricultores.component";
import {TransportistasComponent} from "./components/transportista/transportistas.component";
import {TransporteComponent} from "./components/transportes/transporte.component";

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    component: DashboardComponent,
    children: [
      {
        path: 'cuentas',
        component: CuentasComponent
      },
      {
        path: 'agricultores',
        component: AgricultoresComponent
      },
      {
        path: 'transportistas',
        component: TransportistasComponent
      },
      {
        path: 'transporte',
        component: TransporteComponent
      },
      {
        path: '',
        redirectTo: 'cuentas',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
