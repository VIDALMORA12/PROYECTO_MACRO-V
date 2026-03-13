import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
  capSQLiteChanges,
  capSQLiteValues,
} from '@capacitor-community/sqlite';

import { Usuario } from '../models/usuario';

type SqlValue = string | number | null;

@Injectable({
  providedIn: 'root',
})
export class Database {
  private readonly dbName = 'Macro_V';
  private readonly dbVersion = 1;
  private readonly sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private initializingPromise: Promise<void> | null = null;
  private readonly ready$ = new BehaviorSubject<boolean>(false);

  readonly defaultCiclos: ReadonlyArray<string> = [
    'Ciclo1', 'Ciclo2', 'Ciclo3', 'Ciclo4', 'Ciclo5', 'Ciclo6',
    'Ciclo7', 'Ciclo8', 'Ciclo9', 'Ciclo10', 'Ciclo11', 'Ciclo12',
    'Zona1', 'Zona2', 'Zona3'
  ];

  async initializeDatabase(): Promise<void> {
    if (this.initializingPromise) return this.initializingPromise;

    this.initializingPromise = (async () => {
      try {
        const platform = Capacitor.getPlatform();
        if (platform === 'web') {
          let jeepEl = document.querySelector('jeep-sqlite');
          if (!jeepEl) {
            jeepEl = document.createElement('jeep-sqlite');
            document.body.appendChild(jeepEl);
          }
          await customElements.whenDefined('jeep-sqlite');
          await CapacitorSQLite.initWebStore();
        }

        this.db = await this.sqlite.createConnection(this.dbName, false, 'no-encryption', this.dbVersion, false);
        await this.db.open();
        await this.createSchema();
        await this.seedBaseData();
        await this.persistWebStore();

        this.ready$.next(true);
      } catch (error) {
        console.error('❌ Error crítico:', error);
        this.ready$.next(false);
        throw error;
      }
    })();
    return this.initializingPromise;
  }

  private async createSchema(): Promise<void> {
    const statements = [
      `CREATE TABLE IF NOT EXISTS ciclos (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL UNIQUE, descripcion TEXT);`,
      `CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, rol TEXT, usuario TEXT UNIQUE, contrasena TEXT);`,
      `CREATE TABLE IF NOT EXISTS macro_medidores (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, id_ciclo INTEGER, direccion TEXT, sig_coord TEXT, tipo_instalacion TEXT, estado TEXT DEFAULT 'operativo', observacion TEXT, FOREIGN KEY(id_ciclo) REFERENCES ciclos(id));`,
      `CREATE TABLE IF NOT EXISTS lecturas (id INTEGER PRIMARY KEY AUTOINCREMENT, id_macromedidor TEXT, valor_lectura REAL, estado_encontrado TEXT, observacion TEXT, foto_path TEXT, fecha_lectura TEXT, id_usuario INTEGER, FOREIGN KEY(id_usuario) REFERENCES usuarios(id));`
    ];
    await this.db!.execute(statements.join('\n'));
  }

  private async seedBaseData(): Promise<void> {
    const count = await this.query('SELECT COUNT(*) as total FROM ciclos;');
    if (Number(count.values?.[0]?.total ?? 0) === 0) {
      for (const nombre of this.defaultCiclos) {
        await this.run('INSERT INTO ciclos (nombre) VALUES (?);', [nombre]);
      }
    }
    const userCount = await this.query('SELECT COUNT(*) as total FROM usuarios;');
    if (Number(userCount.values?.[0]?.total ?? 0) === 0) {
      await this.run('INSERT INTO usuarios (nombre, rol, usuario, contrasena) VALUES (?,?,?,?)', ['Admin', 'operador', 'admin', '1234']);
    }
  }

  // --- MÉTODOS RESTAURADOS PARA LOGIN Y REGISTRO ---

  async validarUsuario(user: string, pass: string): Promise<Usuario | null> {
    const result = await this.query('SELECT * FROM usuarios WHERE usuario = ? AND contrasena = ? LIMIT 1;', [user, pass]);
    if (result.values && result.values.length > 0) {
      const d = result.values[0];
      return new Usuario(d.nombre, d.rol, d.usuario, d.contrasena);
    }
    return null;
  }

  async registrarUsuario(u: any): Promise<boolean> {
    const sql = 'INSERT INTO usuarios (nombre, rol, usuario, contrasena) VALUES (?, ?, ?, ?);';
    const result = await this.run(sql, [u.nombre, u.rol || 'operador', u.usuario, u.contrasena]);
    return Number(result.changes?.changes ?? 0) > 0;
  }

  // --- MÉTODOS DE OPERACIÓN ---

  async getCiclos() {
    const res = await this.query('SELECT * FROM ciclos;');
    return res.values || [];
  }

  async guardarLectura(l: any): Promise<boolean> {
    const sql = `INSERT INTO lecturas (id_macromedidor, valor_lectura, estado_encontrado, observacion, foto_path, fecha_lectura, id_usuario) VALUES (?, ?, ?, ?, ?, datetime('now'), ?);`;
    const res = await this.run(sql, [l.id_macromedidor, l.valor_lectura, l.estado_encontrado, l.observacion, l.foto_path, 1]);
    return Number(res.changes?.changes ?? 0) > 0;
  }

  async getTodoElDashboard(): Promise<any> {
    const med = await this.query('SELECT COUNT(*) as total FROM macro_medidores;');
    const lec = await this.query('SELECT COUNT(*) as total FROM lecturas;');
    const cic = await this.query('SELECT COUNT(*) as total FROM ciclos;');

    return {
      totalMedidores: med.values?.[0]?.total ?? 0,
      totalLecturas: lec.values?.[0]?.total ?? 0,
      totalCiclos: cic.values?.[0]?.total ?? 0
    };
  }

  // --- UTILIDADES ---

  private async persistWebStore() {
    if (Capacitor.getPlatform() === 'web') await this.sqlite.saveToStore(this.dbName);
  }

  async run(sql: string, values: SqlValue[] = []) {
    const database = await this.getOpenedConnection();
    const result = await database.run(sql, values);
    await this.persistWebStore();
    return result;
  }

  async query(sql: string, values: SqlValue[] = []) {
    const database = await this.getOpenedConnection();
    return database.query(sql, values);
  }

  private async getOpenedConnection() {
    if (!this.initializingPromise) await this.initializeDatabase();
    await this.initializingPromise;
    if (!this.db || !(await this.db.isDBOpen()).result) await this.db?.open();
    return this.db!;
  }
}