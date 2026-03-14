import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, waterOutline, personOutline, lockClosedOutline } from 'ionicons/icons';
import { Database } from '../../services/database';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class LoginPage {
  usuario = '';
  contrasena = '';
  cargando = false;
  errorMsg = '';
  mostrarPassword = false;

  constructor(private db: Database, private router: Router, private toastCtrl: ToastController) {
    addIcons({ eyeOutline, eyeOffOutline, waterOutline, personOutline, lockClosedOutline });
  }

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  async login() {
    this.errorMsg = '';
    if (!this.usuario.trim() || !this.contrasena.trim()) {
      this.errorMsg = 'Ingrese usuario y contraseña.';
      return;
    }

    this.cargando = true; // Inicia spinner rosa
    try {
      const conectado = await this.db.ensureConnection();
      if (!conectado) {
        this.errorMsg = 'La base de datos se está iniciando. Reintente.'; //
        return;
      }

      const u = await this.db.validarUsuario(this.usuario.trim(), this.contrasena);
      if (u) {
        localStorage.setItem('user_rol', u.rol);
        localStorage.setItem('usuarioActivo', JSON.stringify(u));
        this.router.navigate([u.rol === 'ingeniero' ? '/macro-medidor' : '/home']);
      } else {
        this.errorMsg = 'Usuario o contraseña incorrectos.';
      }
    } catch (e) {
      this.errorMsg = 'La base de datos está tardando. Por favor, refresque.'; //
    } finally {
      this.cargando = false; // APAGADO GARANTIZADO DEL SPINNER
    }
  }
}