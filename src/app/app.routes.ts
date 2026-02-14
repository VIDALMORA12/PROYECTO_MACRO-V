import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'lecturas',
    loadComponent: () => import('./pages/lecturas/lecturas.page').then( m => m.LecturasPage)
  },
  {
    path: 'ciclo',
    loadComponent: () => import('./pages/ciclo/ciclo.page').then( m => m.CicloPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then( m => m.HomePage)
  },
  {
    path: 'usuario',
    loadComponent: () => import('./pages/usuario/usuario.page').then( m => m.UsuarioPage)
  },
  {
    path: 'macro_medidor',
    loadComponent: () => import('./pages/macro_medidor/macro-medidor.page').then( m => m.MacroMedidorPage)
  },
  {
    path: 'perdidas',
    loadComponent: () => import('./pages/perdidas/perdidas.page').then( m => m.PerdidasPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
];
