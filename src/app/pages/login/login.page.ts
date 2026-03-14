import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonCard, IonCardContent, IonItem, IonLabel,
  IonInput, IonButton, IonIcon, IonSpinner, IonText,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, waterOutline } from 'ionicons/icons';
import { Database } from '../../services/database';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonCard, IonCardContent, IonItem, IonLabel,
    IonInput, IonButton, IonIcon, IonSpinner, IonText
  ]
})
export class LoginPage implements OnInit {
  usuario = '';
  contrasena = '';
  mostrarPassword = false;
  cargando = false;
  errorMsg = '';

  constructor(
    private db: Database,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    addIcons({ eyeOutline, eyeOffOutline, waterOutline });
  }

  async ngOnInit() {
    await this.db.initializeDatabase();
  }

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  async login() {
    this.errorMsg = '';

    if (!this.usuario.trim() || !this.contrasena.trim()) {
      this.errorMsg = 'Por favor complete todos los campos.';
      return;
    }

    this.cargando = true;

    const usuarioValido = await this.db.validarUsuario(this.usuario.trim(), this.contrasena);

    this.cargando = false;

    if (usuarioValido) {
      // Guarda el usuario en sesión (puedes usar localStorage o un servicio de sesión)
      localStorage.setItem('usuarioActivo', JSON.stringify(usuarioValido));

      const toast = await this.toastCtrl.create({
        message: `Bienvenido, ${usuarioValido.nombre}`,
        duration: 2000,
        color: 'success'
      });
      await toast.present();

      this.router.navigate(['/home']);
    } else {
      this.errorMsg = 'Usuario o contraseña incorrectos.';
    }
  }
}