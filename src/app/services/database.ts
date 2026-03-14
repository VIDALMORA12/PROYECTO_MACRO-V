import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Usuario } from '../models/usuario';

type SqlValue = string | number | null;

@Injectable({ providedIn: 'root' })
export class Database {
  private readonly dbName = 'Macro_V';
  private readonly sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private initializingPromise: Promise<void> | null = null;
  private readonly ready$ = new BehaviorSubject<boolean>(false);

  constructor() { this.initializeDatabase(); }

  async initializeDatabase(): Promise<void> {
    if (this.initializingPromise) return this.initializingPromise;
    this.initializingPromise = (async () => {
      try {
        const platform = Capacitor.getPlatform();
        if (platform === 'web') {
          let jeepEl = document.querySelector('jeep-sqlite') || document.createElement('jeep-sqlite');
          if (!document.body.contains(jeepEl)) document.body.appendChild(jeepEl);
          await customElements.whenDefined('jeep-sqlite');
          await CapacitorSQLite.initWebStore();
        }
        this.db = await this.sqlite.createConnection(this.dbName, false, 'no-encryption', 1, false);
        await this.db.open();
        await this.createSchema();
        await this.seedBaseData();
        this.ready$.next(true);
      } catch (error) { console.error(error); this.ready$.next(true); }
    })();
  }

  private async createSchema(): Promise<void> {
    // Tabla de lecturas actualizada con ciclo y lectura anterior para Aguas de Manizales
    const query = `
      CREATE TABLE IF NOT EXISTS ciclos (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT UNIQUE);
      CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, rol TEXT, usuario TEXT UNIQUE, contrasena TEXT);
      CREATE TABLE IF NOT EXISTS lecturas (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        id_macromedidor TEXT, 
        ciclo_perteneciente TEXT,
        lectura_anterior REAL DEFAULT 0,
        valor_lectura REAL, 
        estado_encontrado TEXT, 
        observacion TEXT, 
        foto_path TEXT, 
        fecha_lectura TEXT
      );
    `;
    await this.db!.execute(query);
  }

  private async seedBaseData(): Promise<void> {
    await this.db!.run("INSERT OR IGNORE INTO usuarios (nombre, rol, usuario, contrasena) VALUES (?,?,?,?)", ['Admin', 'ingeniero', 'admin', '1234']);
    const ciclos = ['Ciclo 1', 'Ciclo 2', 'Ciclo 3', 'Ciclo 4', 'Ciclo 5', 'Ciclo 6', 'Ciclo 7', 'Ciclo 8', 'Ciclo 9', 'Ciclo 10', 'Ciclo 11', 'Ciclo 12', 'Ciclo 13', 'Ciclo 14', 'Ciclo 15'];
    for (let c of ciclos) { await this.db!.run("INSERT OR IGNORE INTO ciclos (nombre) VALUES (?)", [c]); }
  }

  // MÉTODO NUEVO: Guarda y calcula la lectura anterior automáticamente
  async guardarLecturaCompleta(datos: any): Promise<boolean> {
    try {
      // 1. Buscar la última lectura de este medidor para obtener la anterior
      const ultima = await this.query(
        "SELECT valor_lectura FROM lecturas WHERE id_macromedidor = ? ORDER BY id DESC LIMIT 1", 
        [datos.id_macromedidor]
      );
      
      const lecturaAnterior = ultima.values?.length ? ultima.values[0].valor_lectura : 0;

      // 2. Insertar la nueva lectura
      const sql = `INSERT INTO lecturas 
        (id_macromedidor, ciclo_perteneciente, lectura_anterior, valor_lectura, estado_encontrado, observacion, foto_path, fecha_lectura) 
        VALUES (?,?,?,?,?,?,?,?)`;
      
      const values = [
        datos.id_macromedidor,
        datos.ciclo,
        lecturaAnterior,
        datos.valor_lectura,
        datos.estado_encontrado,
        datos.observacion,
        datos.foto_path,
        datos.fecha_lectura
      ];

      const res = await this.run(sql, values);
      return (res.changes?.changes ?? 0) > 0;
    } catch (e) {
      console.error("Error al guardar en Macro-V:", e);
      return false;
    }
  }

  // MÉTODO NUEVO: Obtiene el historial con la suma calculada
  async getHistorialElegante() {
    const sql = `
      SELECT 
        fecha_lectura as fecha,
        ciclo_perteneciente as ciclo,
        id_macromedidor as nombre,
        lectura_anterior,
        valor_lectura as lectura_actual,
        (lectura_anterior + valor_lectura) as suma_total,
        estado_encontrado as estado,
        observacion
      FROM lecturas 
      ORDER BY id DESC`;
    return await this.query(sql);
  }

  async registrarUsuario(u: any): Promise<boolean> {
    const res = await this.run("INSERT INTO usuarios (nombre, rol, usuario, contrasena) VALUES (?,?,?,?)", [u.nombre, u.rol || 'operador', u.usuario, u.contrasena]);
    return (res.changes?.changes ?? 0) > 0;
  }

  async validarUsuario(user: string, pass: string): Promise<Usuario | null> {
    const res = await this.query("SELECT * FROM usuarios WHERE usuario = ? AND contrasena = ?", [user, pass]);
    return res.values?.length ? res.values[0] : null;
  }

  async getTodoElDashboard() {
    const lec = await this.query("SELECT COUNT(*) as total FROM lecturas");
    const cic = await this.query("SELECT COUNT(*) as total FROM ciclos");
    return { 
      totalLecturas: lec.values?.[0]?.total ?? 0, 
      totalCiclos: cic.values?.[0]?.total ?? 0, 
      totalMedidores: 115 
    };
  }

  async run(sql: string, values: SqlValue[] = []) {
    const res = await this.db!.run(sql, values);
    if (Capacitor.getPlatform() === 'web') await this.sqlite.saveToStore(this.dbName);
    return res;
  }

  async query(sql: string, values: SqlValue[] = []) { return await this.db!.query(sql, values); }
  getDBState() { return this.ready$.asObservable(); }
  async ensureConnection() { if (!this.db) await this.initializeDatabase(); return true; }
}