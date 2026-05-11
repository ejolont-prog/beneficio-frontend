import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CuentasComponent } from './components/cuentas/cuentas.component';
import {AgricultoresComponent} from "./components/agricultores/agricultores.component";
import {TransportistasComponent} from "./components/transportista/transportistas.component";
import {TransporteComponent} from "./components/transportes/transporte.component";
import { LecturaQrComponent } from './components/lectura-qr/lectura-qr.component';
import {DetalleCuentasComponent} from "./components/cuentas/detalle-cuentas/detalle-cuentas.component"; // Verifica que la ruta del archivo sea correcta

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    component: DashboardComponent,
    children: [
      {
          path: 'lectura-qr',
          component: LecturaQrComponent
        },
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
      { path: 'cuentas', component: CuentasComponent },
      { path: 'detalle-cuenta/:noCuenta', component: DetalleCuentasComponent },
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
