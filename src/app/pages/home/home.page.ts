<<<<<<< HEAD
import { Component, OnInit,ViewChild, ElementRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Chart, registerables } from 'chart.js';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class HomePage implements OnInit {
  @ViewChild('pieCanvas') private pieCanvas!: ElementRef;
  pieChart: any;

  constructor() { }

  ngOnInit() {
  }
  ionViewDidEnter() {
    this.createPieChart();
  }

  createPieChart() {
    this.pieChart = new Chart(this.pieCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Ciclo 1', 'Ciclo 2', 'Ciclo 3', 'Ciclo 4', 'Ciclo 5', 'Ciclo 6', 
                 'Ciclo 7', 'Ciclo 8', 'Ciclo 9', 'Ciclo 10', 'Ciclo 11', 'Ciclo 12'],
        datasets: [{
          label: 'Ciclos',
          data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Valores iguales para que se vea simétrico
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
          ],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'CICLOS', font: { size: 20 } }
        }
      }
    });
  }

}
=======
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
>>>>>>> origin/main
