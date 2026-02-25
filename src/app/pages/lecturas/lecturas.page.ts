import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
<<<<<<< HEAD

=======
>>>>>>> origin/main
@Component({
  selector: 'app-lecturas',
  templateUrl: './lecturas.page.html',
  styleUrls: ['./lecturas.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
<<<<<<< HEAD
export class LecturasPage implements OnInit {
=======

export class LecturasPage implements OnInit {
  ciclos: any[] = [];
  medidores: any[] = [];
  idCicloSel!: number;
  idMacroSel!: number;
  
  datos = { valor: 0, novedad: 'Bueno', comentario: '', foto: '', usuario: 'admin' };
>>>>>>> origin/main

  constructor() { }

  ngOnInit() {
  }
<<<<<<< HEAD
=======
  
>>>>>>> origin/main

}
