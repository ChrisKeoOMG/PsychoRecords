import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { QyAComponent } from './qy-a/qy-a.component';
import { SobreNosostrosComponent } from './sobre-nosostros/sobre-nosostros.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    {path: 'inicio', component: InicioComponent},
    {path: 'qya', component: QyAComponent},
    {path: 'nosotros', component: SobreNosostrosComponent},
    {path: 'login', component: LoginComponent},
    {path: '**', pathMatch: 'full', redirectTo: 'inicio' },
];
