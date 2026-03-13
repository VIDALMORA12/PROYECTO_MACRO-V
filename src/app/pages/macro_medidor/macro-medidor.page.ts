import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Database } from '../../services/database'; 
import { addIcons } from 'ionicons';
import { documentTextOutline, imageOutline } from 'ionicons/icons';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-macro-medidor',
  templateUrl: './macro-medidor.page.html',
  styleUrls: ['./macro-medidor.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class MacromedidoresPage {
  dashboard: any[] = [];
  cargando: boolean = true;
  historialMedidores: any[] = [];

  constructor(
    private db: Database,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    addIcons({ documentTextOutline, imageOutline });
  }

  async ionViewWillEnter() {
    await this.cargarTodo();
  }

  async cargarTodo() {
    this.cargando = true;
    try {
      this.dashboard = await this.db.getTodoElDashboard() || [];
      await this.cargarHistorial();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.cargando = false;
    }
  }

  async cargarHistorial() {
    try {
      // Unimos la lista de medidores conocidos con las lecturas reales
      const sql = `
        SELECT l.id_macromedidor as nombre, l.valor_lectura, l.fecha_lectura, l.estado_encontrado, l.foto_path as foto
        FROM lecturas l
        ORDER BY l.fecha_lectura DESC`;
      
      const res = await this.db.query(sql);
      this.historialMedidores = res.values || [];
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  }

  exportarExcel() {
    if (this.historialMedidores.length === 0) {
      this.mostrarToast('No hay datos para exportar', 'warning');
      return;
    }

    const datosParaExcel = this.historialMedidores.map(m => ({
      'Macro-medidor': m.nombre,
      'Lectura Actual': m.valor_lectura,
      'Fecha Registro': m.fecha_lectura,
      'Estado': m.estado_encontrado
    }));

    const hoja = XLSX.utils.json_to_sheet(datosParaExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Reporte Macro-V');
    XLSX.writeFile(libro, 'Reporte_AguasManizales.xlsx');
  }

  private async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({ message: mensaje, duration: 2000, color: color });
    await toast.present();
  }
}