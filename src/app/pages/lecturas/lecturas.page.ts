import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Database } from '../../services/database'; 
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { 
  calendarNumberOutline, 
  chevronForward, 
  speedometerOutline, 
  camera, 
  saveOutline, 
  arrowBackOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-lecturas',
  templateUrl: './lecturas.page.html',
  styleUrls: ['./lecturas.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class LecturasPage implements OnInit {
  paso: number = 1;
  fotoCapturada: string | null = null;
  cicloSeleccionado: any = null;
  medidorSeleccionado: any = null;
  
  medidores: any[] = [];
  medidoresFiltrados: any[] = [];
  searchTerm: string = '';

  ciclos = [
    { nombre: 'Ciclo 1', id: 1 }, { nombre: 'Ciclo 2', id: 2 },
    { nombre: 'Ciclo 3', id: 3 }, { nombre: 'Ciclo 4', id: 4 },
    { nombre: 'Ciclo 5', id: 5 }, { nombre: 'Ciclo 6', id: 6 },
    { nombre: 'Ciclo 7', id: 7 }, { nombre: 'Ciclo 8', id: 8 },
    { nombre: 'Ciclo 9', id: 9 }, { nombre: 'Ciclo 10', id: 10 },
    { nombre: 'Ciclo 11', id: 11 }, { nombre: 'Ciclo 12', id: 12 },
    { nombre: 'Zona 1 Rural', id: 13 }, { nombre: 'Zona 2', id: 14 },
    { nombre: 'Zona 3', id: 15 }
  ];

  private readonly DATA_MACROS: { [key: number]: string[] } = {
    1: ['Curva La Nena', 'Las Vallas', 'Colonizadores', 'Campo Hermoso', 'Sacatín Villapilar', 'Fuente de Chipre', 'Chipre Alto', 'Chipre Jardín - Hondo', 'La Montana', 'Nuevo Montana', 'Riego - Parque del Agua', 'Riego - CR 18 CL 12', 'Riego - CL 7 Pájaros', 'TQ Villapilar'],
    2: ['Bellas Artes', 'Alcazares', 'Arenillo', 'Estambul', '20 de Julio', 'Kumis - Campamento', 'Albania', 'Nogales', 'Bosque - Nogales', 'Jesús Buena Esperanza', 'San Antonio Distribución', 'San Antonio Circuito', 'Canaletas Carmen', 'Riego Castellana CL10 CR28'],
    3: ['Taquilla Fundadores', 'Fundadores 12 Pila', 'Ernesto Gutiérrez', 'Sumatec'],
    4: ['Galán', 'Corintio', 'Puertas del Sol', 'Vereda Neira', 'Bajo Corintio'],
    5: ['Belén', 'Santísima Trinidad', 'Circuito La 51', 'Santa Helena', 'Bomberos Fundadores', 'Sierra Morena', 'La Argentina'],
    6: ['Carola ', ' Alto Carola', 'Villahermosa 1', 'Villahermosa 2', 'Villahermosa 3', 'Villahermosa 4', 'Villahermosa 5', 'Sinai UIS', 'Sinai Circuito', 'Portón del Guamo', 'Guamo', 'CAI Bosques Norte', 'Bombeo San Sebastián', 'Bosques Norte 10 PVC', 'Bosques Norte Nuevo', 'Alto San Cayetano', 'Caribe 1', 'Caribe 2', 'Guamo UIS (CL 48 y CL 48F)', 'Nuevo Guamo UIS', 'Villa Hermosa 8"', 'Villa Hermosa Entrada 12"', 'Caribe 2 Entrada de 10"'],
    7: ['Cable de 12', 'Cable de 14 Bypass', 'Ondas de Otún', 'Linares', 'Isabella - Villa Carmenza', 'Persia', 'Portal San Luis', 'Talleres del Departamento', 'Aguilas', 'CRA 34A CL 25 Nevado', 'CRA 35 CL 26 Torre Nevado', 'Andes Control', 'Andes Parque', 'Riego CR23 CL 45 Cristo Rey', 'Arrayanes UIS', 'Riego CR25 CL 53', 'Nuevo Arrayanes UIS'],
    8: ['ICA', 'Adoratrices 10 PVC', 'Adoratrices 6 PE', 'Granjas y Viviendas', 'Aguacate', 'Sauces', 'Zafiro', 'Entrada Pío XII', 'Pio XII', 'Entrada Colinas', 'Colinas', 'Aranjuez', 'Altos de Castilla', 'La Paz Malhabar', 'La Playita'],
    9: ['Sultana 12 Vía', 'Sultana 10 Separador', 'sultana de 4 separador', 'Policlínica', 'Trans.72CR19 Matadero', 'Distriplaya 1', 'Distriplaya 2', 'Distriplaya 3', 'Distriplaya 4', 'Alta Suiza', 'TQ 23B Salida 14', 'TQ 23B Salida 8', 'TQ 23 Salida 16', 'TQ 23B Salida 24', 'Tanque distribucion Torre 24', 'Facturación', 'Baños niza', 'Hidrante niza', 'alto del perro', 'Laureles', 'La Rambla', 'Bajo Rosales', 'Bomberos estadio', 'Cable san antonio de 24 Distribucion', 'Cable Palermo 8"', 'Palermo Camelia', 'Edificio cervantes de 9', 'Edificio cervantes de 12', 'Edificio cervantes de 15', 'La Leonora', 'Entrada 18 TQ Distribucion', 'Entrada 28 TQ Distribucion', 'Conduccion zona norte', 'Riego CR24 CLL58', 'Riego CR23 CLL58', 'Riego CR22 CLL73 Celema', 'Riego CR 23 # 75 - 248 Colegio Milán ', 'Riego CR 23 # 73 - 112 Milán', 'RiegoCLL 77 CRA 19 A Ed. Los Quindos', 'Riego CLL 77 CRA 23 Pila de Milán ', 'Riego CLL 61 # 24 A - 37 La Estrella', 'Riego CLL 59 # 23 A - 31 La Estrella ', 'Riego CRA 25 # 65 - 113 Av. Palermo', 'Riego CRA 25 CLL 67 Palermo', 'Riego CRA 25 CLL 68 Palermo', 'Riego CRA 25 CLL 70 Palermo'],
    10: ['Chacha Frutos', 'Lusitania', 'Colegios Florida', 'Expoferias'],
    11: ['TQ Enea 1', 'TQ Enea 2', 'TQ Enea 3', 'Enea Colegio Ravasco', 'Enea Botadero Control', 'Bomberos SENA'],
    12: ['Sacatín Rural', 'San Peregrino', 'La Aurora', 'La Francia', 'Noviciado', 'Bajo Tablazo de 6"', 'Santa Sofía', 'La Tribu', 'U. Antonio Nariño', 'PQ La Abuelita', 'El Aventino', 'La Travesía', 'Bajo Tablazo 3"', 'Conjunto Javas', 'Salida Javas'],
    13: ['La Linda', 'La Cuchilla', 'Granja San Jose', 'La Palma', 'TQ Fonditos', 'TQ Fonditos', 'Morro Gordo', 'Cueva Santa', 'Conducción La Cabaña', 'Malpaso', 'La Cabaña 1', 'La Cabaña 2', 'Monte Redondo', 'Las Pavas', 'Miramar 1', 'Miramar 2', 'El Zapote', 'La Manuela', 'Altamar 1', 'Altamar 2', 'Caney', 'TQ Morro Caliente', 'Altos de Caney', 'Tres Puertas', 'Salida morro caliente', 'El Agrado', 'La Rosita'],
    14: ['Alto del Zarzo', 'TQ Entrada Lomas', 'Nuevo TQ Lomas', 'Salida Lomas', 'Once Caldas', 'Club Campestre', 'Bomboneras', 'Club de Golf', 'Conjunto Altos del Campestre'],
    15: ['Alto de los Picos', 'Las Tres Torres 1', 'Las Tres Torres 2', 'Seminario', 'El Bosque', 'TQ Volteadero', 'Volteadero San Peregrino', 'El Rodeo', 'Entrada a La China', 'Gemelli', 'Morrogacho']
  };

  registro = { lectura: null as number | null, estado: 'Bueno', observacion: '' };

  constructor(private db: Database, private toast: ToastController) {
    addIcons({ calendarNumberOutline, chevronForward, speedometerOutline, camera, saveOutline, arrowBackOutline });
  }

  ngOnInit() {}

  seleccionarCiclo(ciclo: any) {
    this.cicloSeleccionado = ciclo;
    const nombres = this.DATA_MACROS[ciclo.id] || [];
    this.medidores = nombres.map((n, index) => ({ id: index, nombre: n }));
    this.medidoresFiltrados = [...this.medidores];
    this.paso = 2;
  }

  buscarMedidor(event: any) {
    const texto = (event.target.value || '').toLowerCase();
    this.searchTerm = texto;
    this.medidoresFiltrados = this.medidores.filter(m => 
      m.nombre.toLowerCase().includes(texto)
    );
  }

  irAFormulario(medidor: any) {
    this.medidorSeleccionado = medidor;
    this.registro = { lectura: null, estado: 'Bueno', observacion: '' };
    this.fotoCapturada = null;
    this.paso = 3;
  }

  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 50,
        allowEditing: false, 
        resultType: CameraResultType.DataUrl, 
        source: CameraSource.Camera
      });
      this.fotoCapturada = image.dataUrl || null;
    } catch (e) {
      console.warn("Cámara cancelada");
    }
  }

  async guardarLectura() {
    // 1. Validaciones de negocio
    if (this.registro.lectura === null) {
      this.mostrarToast('Por favor, ingrese la lectura.');
      return;
    }

    if (this.registro.estado !== 'Bueno' && !this.fotoCapturada) {
      this.mostrarToast('Es obligatorio tomar una foto para este estado.');
      return;
    }

    try {
      await this.db.ensureConnection();

      // 2. Preparar el objeto para el nuevo método inteligente del servicio
      const datosParaGuardar = {
        id_macromedidor: this.medidorSeleccionado.nombre,
        ciclo: this.cicloSeleccionado.nombre, // Usamos el nombre del ciclo (Ej: 'Ciclo 1')
        valor_lectura: this.registro.lectura,
        estado_encontrado: this.registro.estado,
        observacion: this.registro.observacion || '',
        foto_path: this.fotoCapturada || '',
        fecha_lectura: new Date().toLocaleString() // Fecha formateada localmente
      };
      
      // 3. Llamada al servicio que gestiona la lectura anterior y la suma
      const exito = await this.db.guardarLecturaCompleta(datosParaGuardar);

      if (exito) {
        this.mostrarToast('Registro guardado con éxito en Aguas de Manizales.');
        
        // 4. Reinicio de la interfaz
        this.paso = 1;
        this.fotoCapturada = null;
        this.registro = { lectura: null, estado: 'Bueno', observacion: '' };
      } else {
        throw new Error("No se pudo insertar el registro");
      }
      
    } catch (e) {
      console.error("Error al guardar:", e);
      this.mostrarToast('Error crítico al guardar la lectura.');
    }
  }

  async mostrarToast(mensaje: string) {
    const t = await this.toast.create({ 
      message: mensaje, 
      duration: 2000, 
      position: 'bottom',
      color: mensaje.includes('Error') ? 'danger' : 'dark'
    });
    await t.present();
  }
}