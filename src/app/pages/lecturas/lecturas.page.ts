import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
@Component({
  selector: 'app-lecturas',
  templateUrl: './lecturas.page.html',
  styleUrls: ['./lecturas.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})

export class LecturasPage implements OnInit {
  ciclos: any[] = [];
  medidores: any[] = [];
  idCicloSel!: number;
  idMacroSel!: number;
  
  datos = { valor: 0, novedad: 'Bueno', comentario: '', foto: '', usuario: 'admin' };

  constructor() { }

  ngOnInit() {
  }
  

}
