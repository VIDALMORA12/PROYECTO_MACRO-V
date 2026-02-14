import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-macro-medidor',
  templateUrl: './macro-medidor.page.html',
  styleUrls: ['./macro-medidor.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MacroMedidorPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
