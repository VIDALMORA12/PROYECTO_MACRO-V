import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.page.html',
  styleUrls: ['./usuario.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class UsuarioPage implements OnInit {
  datosUsuario: any = null;

  constructor() { }

  ngOnInit() {
    // Recuperamos los datos que guardamos en el login
    const session = localStorage.getItem('usuarioActivo');
    if (session) {
      this.datosUsuario = JSON.parse(session);
    }
  }
}
