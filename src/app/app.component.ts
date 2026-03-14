import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { 
  IonApp, IonSplitPane, IonMenu, IonContent, IonList, 
  IonListHeader, IonNote, IonMenuToggle, IonItem, 
  IonIcon, IonLabel, IonRouterOutlet 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, pieChart, map, receipt, timer, bookmarkOutline, bookmarkSharp } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    RouterLink, RouterLinkActive, IonApp, IonSplitPane, 
    IonMenu, IonContent, IonList, IonListHeader, 
    IonNote, IonMenuToggle, IonItem, IonIcon, 
    IonLabel, IonRouterOutlet
  ],
})
export class AppComponent {
  public appPages = [
    { title: 'Home', url: '/home', icon: 'home' },
    { title: 'Ciclo', url: '/ciclo', icon: 'map' },
    { title: 'Perdidas', url: '/perdidas', icon: 'pie-chart' },
    { title: 'Lecturas', url: '/lecturas', icon: 'receipt' },
    { title: 'Macro medidores', url: '/macro-medidor', icon: 'timer' },
  ];
  public labels = ['Responsabilidad', 'Honestidad', 'Respeto', 'Trabajo en equipo'];

  constructor(public router: Router) { // 'public' es clave aquí
    addIcons({ 
      home:home, pieChart:pieChart, map:map, receipt:receipt, timer:timer, 
      bookmarkOutline:bookmarkOutline, bookmarkSharp:bookmarkSharp 
    });
  }
}