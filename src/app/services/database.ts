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

// Tipos permitidos para parámetros SQL
type SqlValue = string | number | null;

// --- INTERFACES BASADAS EN TU DIAGRAMA MACRO-V ---

export interface CicloRecord {
  id_ciclo: number;
  descripcion: string;
  periodicidad: string;
}

export interface UsuarioRecord {
  usuario: string;
  nombre: string;
  rol: string;
  contrasena: string;
}

export interface MacroMedidorRecord {
  id_macro: number;
  nombre: string;
  direccion: string;
  sig_coord: string;
  tipo_instalacion: string;
  id_ciclo: number;
}

export interface LecturaRecord {
  id_lectura: number;
  valor: number;
  fecha: string;
  novedad_estado: string;
  id_macro_foto: string;
  id_macro: number;
  id_usuario: string;
}

export interface PerdidaRecord {
  id_perdida: number;
  mes_anio: string; // Evitamos la 'ñ' por errores de compilación en Angular
  valor_perdida: number;
  id_ciclo: number;
}

@Injectable({
  providedIn: 'root',
})
export class Database {
  private readonly dbName = 'macro_v_db';
  private readonly dbVersion = 1;
  private readonly sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private initializingPromise: Promise<void> | null = null;
  private readonly ready$ = new BehaviorSubject<boolean>(false);

  constructor() {}

  // --- INICIALIZACIÓN ---

  async initializeDatabase(): Promise<void> {
    if (this.ready$.value && this.db) return;

    if (this.initializingPromise) {
      await this.initializingPromise;
      return;
    }

    this.initializingPromise = this.initializeDatabaseInternal();
    try {
      await this.initializingPromise;
    } finally {
      this.initializingPromise = null;
    }
  }

  private async initializeDatabaseInternal(): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
      await CapacitorSQLite.initWebStore();
    }

    const consistency = await this.sqlite.checkConnectionsConsistency();
    const isConn = await this.sqlite.isConnection(this.dbName, false);

    if (consistency.result && isConn.result) {
      this.db = await this.sqlite.retrieveConnection(this.dbName, false);
    } else {
      this.db = await this.sqlite.createConnection(this.dbName, false, 'no-encryption', this.dbVersion, false);
    }

    await this.db.open();
    await this.createSchema();
    await this.seedBaseData();
    await this.persistWebStore();
    this.ready$.next(true);
  }

  isReady(): Observable<boolean> {
    return this.ready$.asObservable();
  }

  // --- MÉTODOS DE EJECUCIÓN ---

  async run(sql: string, values: SqlValue[] = []): Promise<capSQLiteChanges> {
    const database = await this.getOpenedConnection();
    const result = await database.run(sql, values);
    await this.persistWebStore();
    return result;
  }

  async query(sql: string, values: SqlValue[] = []): Promise<capSQLiteValues> {
    const database = await this.getOpenedConnection();
    return database.query(sql, values);
  }

  // --- CRUD CICLOS ---

  async getCiclos(): Promise<CicloRecord[]> {
    const result = await this.query('SELECT * FROM ciclo ORDER BY id_ciclo ASC;');
    return (result.values ?? []) as CicloRecord[];
  }

  async createCiclo(c: CicloRecord): Promise<number> {
    const result = await this.run(
      'INSERT INTO ciclo (id_ciclo, descripcion, periodicidad) VALUES (?, ?, ?);',
      [c.id_ciclo, c.descripcion, c.periodicidad]
    );
    return Number(result.changes?.lastId ?? 0);
  }

  // --- CRUD USUARIOS ---

  async getUsuarios(): Promise<UsuarioRecord[]> {
    const result = await this.query('SELECT * FROM usuario ORDER BY nombre ASC;');
    return (result.values ?? []) as UsuarioRecord[];
  }

  async createUsuario(u: UsuarioRecord): Promise<void> {
    await this.run(
      'INSERT INTO usuario (usuario, nombre, rol, contrasena) VALUES (?, ?, ?, ?);',
      [u.usuario, u.nombre, u.rol, u.contrasena]
    );
  }

  // --- CRUD MACRO MEDIDORES ---

  async getMacroMedidores(): Promise<MacroMedidorRecord[]> {
    const result = await this.query('SELECT * FROM macro_medidor ORDER BY nombre ASC;');
    return (result.values ?? []) as MacroMedidorRecord[];
  }

  async createMacroMedidor(m: Omit<MacroMedidorRecord, 'id_macro'>): Promise<number> {
    const result = await this.run(
      'INSERT INTO macro_medidor (nombre, direccion, sig_coord, tipo_instalacion, id_ciclo) VALUES (?, ?, ?, ?, ?);',
      [m.nombre, m.direccion, m.sig_coord, m.tipo_instalacion, m.id_ciclo]
    );
    return Number(result.changes?.lastId ?? 0);
  }

  // --- CRUD PÉRDIDAS ---

  async getPerdidas(): Promise<PerdidaRecord[]> {
    const result = await this.query('SELECT * FROM perdidas ORDER BY id_perdida DESC;');
    return (result.values ?? []) as PerdidaRecord[];
  }

  async createPerdida(p: Omit<PerdidaRecord, 'id_perdida'>): Promise<number> {
    const result = await this.run(
      'INSERT INTO perdidas (mes_anio, valor_perdida, id_ciclo) VALUES (?, ?, ?);',
      [p.mes_anio, p.valor_perdida, p.id_ciclo]
    );
    return Number(result.changes?.lastId ?? 0);
  }

  // --- GESTIÓN INTERNA ---

  private async getOpenedConnection(): Promise<SQLiteDBConnection> {
    if (!this.db) await this.initializeDatabase();
    if (!this.db) throw new Error('No fue posible abrir la conexión SQLite');
    const isOpen = await this.db.isDBOpen().catch(() => ({ result: false }));
    if (!isOpen.result) await this.db.open();
    return this.db;
  }

  private async persistWebStore(): Promise<void> {
    if (Capacitor.getPlatform() !== 'web') return;
    try {
      await this.sqlite.saveToStore(this.dbName);
    } catch (error) {
      await CapacitorSQLite.initWebStore().catch(() => undefined);
      await this.sqlite.saveToStore(this.dbName).catch(() => undefined);
    }
    
  }

  private async createSchema(): Promise<void> {
    const database = await this.getOpenedConnection();
    const statements = [
      'PRAGMA foreign_keys = ON;',
      `CREATE TABLE IF NOT EXISTS ciclo (
        id_ciclo INTEGER PRIMARY KEY,
        descripcion TEXT,
        periodicidad TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS usuario (
        usuario TEXT PRIMARY KEY,
        nombre TEXT,
        rol TEXT,
        contrasena TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS macro_medidor (
        id_macro INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        direccion TEXT,
        sig_coord TEXT,
        tipo_instalacion TEXT,
        id_ciclo INTEGER,
        FOREIGN KEY (id_ciclo) REFERENCES ciclo(id_ciclo)
      );`,
      `CREATE TABLE IF NOT EXISTS lectura (
        id_lectura INTEGER PRIMARY KEY AUTOINCREMENT,
        valor REAL,
        fecha TEXT,
        novedad_estado TEXT,
        id_macro_foto TEXT,
        id_macro INTEGER,
        id_usuario TEXT,
        FOREIGN KEY (id_macro) REFERENCES macro_medidor(id_macro),
        FOREIGN KEY (id_usuario) REFERENCES usuario(usuario)
      );`,
      `CREATE TABLE IF NOT EXISTS perdidas (
        id_perdida INTEGER PRIMARY KEY AUTOINCREMENT,
        mes_anio TEXT,
        valor_perdida REAL,
        id_ciclo INTEGER,
        FOREIGN KEY (id_ciclo) REFERENCES ciclo(id_ciclo)
      );`
    ];
    await database.execute(statements.join('\n'));
  }

  private async seedBaseData(): Promise<void> {
    const countResult = await this.query('SELECT COUNT(*) as total FROM ciclo;');
    if (Number(countResult.values?.[0]?.total ?? 0) === 0) {
      await this.run('INSERT INTO ciclo (id_ciclo, descripcion, periodicidad) VALUES (1, "Mensual", "30 dias");');
      await this.run('INSERT INTO usuario (usuario, nombre, rol, contrasena) VALUES ("admin", "Admin MacroV", "Admin", "1234");');
      console.log('Datos base Macro-V insertados.');
    }
  }
  // --- CONSULTAS AVANZADAS PARA REPORTES ---

// 1. Obtener Lecturas de un Medidor comparando con la anterior (para el color Rojo)
async getLecturasConComparacion(idMacro: number) {
  const sql = `
    SELECT *, 
    LAG(valor) OVER (ORDER BY fecha ASC) as valor_anterior
    FROM lectura 
    WHERE id_macro = ? 
    ORDER BY fecha DESC`;
  const res = await this.query(sql, [idMacro]);
  return res.values ?? [];
}

// 2. Obtener Pérdidas totales por Ciclo (Suma de lecturas del mes)
  async getResumenPerdidasPorCiclo() {
    const sql = `
      SELECT c.id_ciclo, c.descripcion, p.mes_anio, SUM(p.valor_perdida) as total_perdida
      FROM ciclo c
      JOIN perdidas p ON c.id_ciclo = p.id_ciclo
      GROUP BY c.id_ciclo, p.mes_anio`;
    const res = await this.query(sql);
    return res.values ?? [];
  }
}