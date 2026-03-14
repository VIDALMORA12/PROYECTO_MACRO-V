import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, personAddOutline, arrowBackOutline } from 'ionicons/icons';
import { Database } from '../../services/database';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class RegistroPage {
  nombre = '';
  usuario = '';
  rol = '';
  contrasena = '';
  confirmarContrasena = '';
  cargando = false;
  errorMsg = '';
  mostrarPassword = false;

  constructor(private db: Database, private router: Router, private toastCtrl: ToastController) {
    addIcons({ eyeOutline, eyeOffOutline, personAddOutline, arrowBackOutline });
  }

  togglePassword() { this.mostrarPassword = !this.mostrarPassword; }

  async registrar() {
    this.errorMsg = '';
    if (!this.nombre || !this.usuario || !this.rol || !this.contrasena) {
      this.errorMsg = 'Complete todos los campos.';
      return;
    }
    if (this.contrasena !== this.confirmarContrasena) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }

    this.cargando = true; //
    try {
      await this.db.ensureConnection();
      const creado = await this.db.registrarUsuario({
        nombre: this.nombre,
        rol: this.rol,
        usuario: this.usuario.trim(),
        contrasena: this.contrasena
      });

      if (creado) {
        const toast = await this.toastCtrl.create({ message: 'Usuario creado', duration: 2000, color: 'success' });
        await toast.present();
        this.router.navigate(['/login']);
      } else {
        this.errorMsg = 'El usuario ya existe.';
      }
    } catch (e) {
      this.errorMsg = 'Error al registrar.';
    } finally {
      this.cargando = false; // Quita el spinner incluso si falla el registro
    }
  }
}