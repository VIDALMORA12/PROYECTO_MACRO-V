import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Database } from '../../services/database'; 
import { addIcons } from 'ionicons';
// IMPORTANTE: Agregamos camera y cameraOutline aquí
import { 
  documentTextOutline, 
  imageOutline, 
  statsChartOutline, 
  refreshOutline, 
  arrowBackOutline, 
  downloadOutline,
  camera, 
  cameraOutline 
} from 'ionicons/icons';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-macro-medidor',
  templateUrl: './macro-medidor.page.html',
  styleUrls: ['./macro-medidor.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class MacromedidoresPage implements OnInit {
  ciclos: any[] = []; 
  cargando: boolean = true;
  historialMedidores: any[] = [];
  
  dashboard: any = {
    totalMedidores: 0,
    totalLecturas: 0,
    totalCiclos: 0
  };

  constructor(
    private db: Database,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    // Registro de iconos para que funcionen en el HTML
    addIcons({ 
      documentTextOutline, 
      imageOutline, 
      statsChartOutline, 
      refreshOutline, 
      arrowBackOutline, 
      downloadOutline,
      camera, 
      cameraOutline 
    });
  }

  async ngOnInit() {
    this.db.getDBState().subscribe(async (ready) => {
      if (ready) {
        await this.cargarTodo();
      }
    });
  }

  async ionViewWillEnter() {
    await this.cargarTodo();
  }

  async cargarTodo() {
    this.cargando = true;
    try {
      await this.db.ensureConnection();
      this.dashboard = await this.db.getTodoElDashboard();

      const res = await this.db.query('SELECT * FROM ciclos ORDER BY nombre ASC');
      this.ciclos = res.values || [];

      await this.cargarHistorial();
    } catch (error) {
      console.error('Error en carga:', error);
      this.mostrarToast('Error al conectar con la base de datos', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  async cargarHistorial() {
    try {
      const sql = `
        SELECT 
          id,
          fecha_lectura as fecha, 
          ciclo_perteneciente as ciclo,
          id_macromedidor as nombre, 
          IFNULL(lectura_anterior, 0) as lectura_anterior, 
          valor_lectura as lectura_actual, 
          (IFNULL(lectura_anterior, 0) + valor_lectura) as suma_total,
          estado_encontrado as estado,
          observacion,
          foto_path
        FROM lecturas 
        ORDER BY id DESC`;
      
      const res = await this.db.query(sql);
      this.historialMedidores = res.values || [];
    } catch (e) {
      console.error('Error al cargar historial:', e);
    }
  }

  async verEvidencia(foto: string) {
    if (!foto) {
      this.mostrarToast('No hay foto disponible para esta lectura', 'warning');
      return;
    }
    
    const alert = await this.alertCtrl.create({
      header: 'Evidencia Fotográfica',
      message: `<img src="${foto}" style="border-radius: 8px; width: 100%;">`,
      buttons: ['Cerrar']
    });
    await alert.present();
  }

  exportarExcel() {
    if (this.historialMedidores.length === 0) {
      this.mostrarToast('No hay datos para exportar', 'warning');
      return;
    }

    const datosParaExportar = this.historialMedidores.map(m => ({
      'Fecha': m.fecha,
      'Ciclo': m.ciclo,
      'Macromedidor': m.nombre,
      'Lectura Anterior': m.lectura_anterior,
      'Lectura Actual': m.lectura_actual,
      'Suma Total': m.suma_total,
      'Estado': m.estado,
      'Observaciones': m.observacion
    }));

    const hoja = XLSX.utils.json_to_sheet(datosParaExportar);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Lecturas Macro-V');
    
    const fechaArchivo = new Date().toISOString().slice(0,10);
    XLSX.writeFile(libro, `Reporte_Lecturas_Manizales_${fechaArchivo}.xlsx`);
    this.mostrarToast('Excel descargado con éxito', 'success');
  }

  private async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({ 
      message: mensaje, 
      duration: 2000, 
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}