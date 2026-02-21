import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, 
  IonIcon, IonList, IonItem, IonLabel, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent, IonBadge, 
  IonListHeader, IonInput, IonSelect, IonSelectOption 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleOutline, waterOutline, locationOutline, saveOutline } from 'ionicons/icons';
import { Database, MacroMedidorRecord, CicloRecord } from '../../services/database';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, 
    IonContent, IonButton, IonIcon, IonList, IonItem, IonLabel, 
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, 
    IonListHeader, IonInput, IonSelect, IonSelectOption
  ]
})
export class HomePage implements OnInit {
  listaMedidores: MacroMedidorRecord[] = [];
  listaCiclos: CicloRecord[] = [];

  // Objeto para vincular al formulario
  nuevoMedidor = {
    nombre: '',
    direccion: '',
    sig_coord: '',
    tipo_instalacion: '',
    id_ciclo: 1 // Por defecto el ciclo 1 (Mensual)
  };

  constructor(private db: Database) {
    addIcons({ addCircleOutline, waterOutline, locationOutline, saveOutline });
  }

  async ngOnInit() {
    await this.db.initializeDatabase();
    this.cargarDatos();
  }

  async cargarDatos() {
    this.listaMedidores = await this.db.getMacroMedidores();
    this.listaCiclos = await this.db.getCiclos();
  }

  async guardarMedidor() {
    if (this.nuevoMedidor.nombre.trim() === '') return;

    await this.db.createMacroMedidor(this.nuevoMedidor);
    
    // Limpiar formulario y recargar lista
    this.nuevoMedidor = {
      nombre: '',
      direccion: '',
      sig_coord: '',
      tipo_instalacion: '',
      id_ciclo: 1
    };
    this.cargarDatos();
  }
}