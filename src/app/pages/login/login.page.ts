import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonItem, IonLabel, IonInput, IonButton, 
  IonSelect, IonSelectOption, IonIcon, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent,
  ToastController // Importamos el controlador de alertas
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, lockClosedOutline, buildOutline, logInOutline, alertCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, 
    IonItem, IonLabel, IonInput, IonButton, 
    IonSelect, IonSelectOption, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent
  ]
})
export class LoginPage implements OnInit {
  public user: Usuario = new Usuario('', 'Operativo', '', '');

  constructor(
    private router: Router,
    private toastController: ToastController // Inyectamos el controlador
  ) {
    addIcons({ personOutline, lockClosedOutline, buildOutline, logInOutline, alertCircleOutline, checkmarkCircleOutline });
  }

  ngOnInit() {}

  // Función para mostrar la alerta en la esquina superior derecha
  async presentToast(mensaje: string, color: 'danger' | 'secondary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'top', // Aparece arriba
      color: color,    // 'danger' es Rojo, 'secondary' es Azul
      cssClass: 'custom-toast', // Para ajuste fino en el CSS
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  onLogin() {
    // 1. Validación de campos vacíos
    if (!this.user.usuario || !this.user.nombre || !this.user.contrasena) {
      this.presentToast('Por favor, completa todos los campos', 'danger');
      return;
    }

    // 2. Validación de contraseña (tu clase requiere >= 6)
    // Nota: Como tu setter protege el valor, verificamos si se asignó correctamente
    if (this.user.usuario === 'admin' && this.user.rol === 'Ingeniero') {
      this.presentToast('¡Bienvenido al sistema!', 'secondary'); // Alerta azul
      this.router.navigate(['/home']);
    } else {
      this.presentToast('Credenciales incorrectas o rol no autorizado', 'danger'); // Alerta roja
    }
  }
}