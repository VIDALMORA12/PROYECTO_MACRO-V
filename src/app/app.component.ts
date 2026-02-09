
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonRouterLink } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, pieChart, map, receipt, timer } from 'ionicons/icons';
import { Usuario } from './models/usuario';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [RouterLink, RouterLinkActive, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterLink, IonRouterOutlet],
})
export class AppComponent {
  user: Usuario;
  public appPages = [
    { title: 'Home', url: 'home', icon: 'home' },
    { title: 'Ciclo', url: 'ciclo', icon: 'map' },
    { title: 'Perdidas', url: 'perdidas', icon: 'pie-chart' },
    { title: 'Lecturas', url: 'lecturas', icon: 'receipt' },
    { title: 'Macro_medidores', url: 'macro_medidor', icon: 'timer' },
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  
  
  constructor() {
    addIcons({ home, pieChart, map, receipt, timer });
    this.user = new Usuario('vidal', 'operativo', 'vamorales', 'aguas123');
  }
}
