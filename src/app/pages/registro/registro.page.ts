import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonCard, IonCardContent, IonItem, IonLabel,
  IonInput, IonButton, IonIcon, IonSpinner, IonText,
  IonSelect, IonSelectOption, IonButtons, IonBackButton,
  ToastController, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, personAddOutline } from 'ionicons/icons';
import { Database } from '../../services/database';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonCard, IonCardContent, IonItem, IonLabel,
    IonInput, IonButton, IonIcon, IonSpinner, IonText,
    IonSelect, IonSelectOption, IonButtons, IonBackButton
  ]
})
export class RegistroPage implements OnInit {
  nombre = '';
  usuario = '';
  rol = '';
  contrasena = '';
  confirmarContrasena = '';
  mostrarPassword = false;
  cargando = false;
  errorMsg = '';

  constructor(
    private db: Database,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ eyeOutline, eyeOffOutline, personAddOutline });
  }

  async ngOnInit() {
    // Aseguramos que la base de datos esté lista al entrar
    await this.db.initializeDatabase();
  }

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

    async registrar() {
    this.errorMsg = '';

    // 1. Validaciones
    if (!this.nombre.trim() || !this.usuario.trim() || !this.rol || !this.contrasena) {
      this.errorMsg = 'Por favor complete todos los campos.';
      return;
    }

    if (this.contrasena !== this.confirmarContrasena) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }

    this.cargando = true;

    try {
      // 2. Creamos el objeto con los datos
      const nuevoUsuario = {
        nombre: this.nombre.trim(),
        rol: this.rol,
        usuario: this.usuario.trim(),
        contrasena: this.contrasena
      };

      // 3. LLAMADA AL SERVICIO (Aquí estaba el error)
      // Usamos 'this.db' para acceder al servicio y ejecutamos el método
      const creado = await this.db.registrarUsuario(nuevoUsuario);

      if (creado) {
        const toast = await this.toastCtrl.create({
          message: 'Cuenta creada exitosamente.',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.router.navigate(['/login']);
      }

    } catch (error: any) {
      // Si el usuario ya existe, el 'UNIQUE' de la base de datos lanzará un error aquí
      this.errorMsg = 'Error: El nombre de usuario ya existe o no se pudo conectar.';
      console.error(error);
    } finally {
      this.cargando = false;
    }
  }

  
}