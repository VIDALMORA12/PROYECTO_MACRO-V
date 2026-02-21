// Importa el decorador Injectable para registrar este servicio en el sistema de inyección de Angular.
import { Injectable } from '@angular/core';
// Importa BehaviorSubject para manejar estado reactivo y Observable para exponerlo de forma segura.
import { BehaviorSubject, Observable } from 'rxjs';
// Importa Capacitor para detectar en qué plataforma corre la app (web, android, ios).
import { Capacitor } from '@capacitor/core';
// Importa las clases y tipos necesarios del plugin SQLite para crear y operar la base de datos.
import {
  // Objeto principal del plugin SQLite de Capacitor.
  CapacitorSQLite,
  // Clase que gestiona conexiones SQLite a nivel global.
  SQLiteConnection,
  // Tipo de una conexión concreta abierta hacia una base de datos.
  SQLiteDBConnection,
  // Tipo de retorno para operaciones que modifican datos (INSERT, UPDATE, DELETE).
  capSQLiteChanges,
  // Tipo de retorno para consultas que devuelven filas (SELECT).
  capSQLiteValues,
} from '@capacitor-community/sqlite';

// Define los tipos de valor permitidos al enviar parámetros SQL.
type SqlValue = string | number | null;

// Define la forma de un registro de ciclos leído desde la base de datos.
export interface Ciclo {
  // Identificador único del ciclo.
  id: number;
  // Nombre del ciclo.
  name: string;
  // Descripción opcional del ciclo.
  description: string | null;
  // Periodicidad del ciclo (por ejemplo: 'Diario', 'Semanal', etc.).
  periodicity: string | null;

}

// Define la forma de un registro de lecturas leído desde la base de datos.
export interface Lecturas {
  // Identificador único de lecturas.
  id_lectura: number;
  //nombre del ciclo al que pertenece la lectura.
  name: string;
  // Valor numérico de la lectura.
  valor_lectura: number;
  // Fecha y hora de la lectura en formato ISO.
  fecha_lectura: string;
  // Estado de novedad asociado a la lectura (por ejemplo: 'Normal', 'Alerta', etc.).
  novedad_estado: string;
  // Identificador del macro foto relacionado con esta lectura.
  id_macro_foto: number;
  // Identificador del usuario que registró la lectura.
  id_usuario: string;

}

// Define la forma de ver como esta el macro_medidor leído desde la base de datos.
export interface Macro_Medidor {
  // Identificador único del macro_medidor.
  id_macro_medidor: number;
  // Identificador del ciclo al que pertenece el macro_medidor.
  id_ciclo: number;
  // Nombre del macro_medidor.
  nombre: string;
  // Dirección del macro_medidor.
  direccion: string;
  // Coordenadas SIG del macro_medidor.
  sig_coord: string;
  // Tipo de instalación del macro_medidor (por ejemplo: 'Residencial', 'Comercial', etc.).
  tipo_instalacion: string;
  // que lectura lleva el macro_medidor por ciclo .
  valor_lectura: number;
}

// Define la estructura de datos necesaria para crear una receta nueva.
export interface Perdidas {
  // Nombre del ciclo de la perdida y del macro medidor .
  
  name: string;
  // Subtítulo opcional.
  subtitle?: string | null;
  // Descripción opcional.
  description?: string | null;
  // Instrucciones opcionales.
  instructions?: string | null;
  // Tiempo requerido opcional en minutos.
  timeRequired?: number | null;
}

// Define la estructura de datos necesaria para actualizar una receta existente.
export interface UpdateRecipeInput extends CreateRecipeInput {
  // Identificador obligatorio de la receta a actualizar.
  id: number;
}

// Define la forma de un registro de usuario leído desde la base de datos.
export interface UsuarioRecord {
  // Identificador único del usuario.
  id: number;
  // Nombre completo del usuario.
  nombre: string;
  // Rol del usuario dentro de la aplicación.
  rol: string;
  // Nombre de usuario para autenticación o identificación.
  usuario: string;
  // Contraseña almacenada en texto (idealmente debería almacenarse hasheada).
  contrasena: string;
}

// Declara este servicio como inyectable y disponible globalmente en toda la aplicación.
@Injectable({
  // Indica que Angular creará una sola instancia compartida del servicio.
  providedIn: 'root',
})
// Define la clase del servicio que centraliza el acceso a SQLite.
export class Database {
  // Nombre físico del archivo de base de datos.
  private readonly dbName = 'cookbook_db';
  // Versión del esquema de base de datos.
  private readonly dbVersion = 1;
  // Instancia administradora de conexiones SQLite.
  private readonly sqlite = new SQLiteConnection(CapacitorSQLite);
  // Referencia a la conexión activa; empieza en null hasta inicializarse.
  private db: SQLiteDBConnection | null = null;
  // Promesa de inicialización en curso para evitar ejecuciones concurrentes.
  private initializingPromise: Promise<void> | null = null;
  // Estado reactivo de disponibilidad de la base de datos.
  private readonly ready$ = new BehaviorSubject<boolean>(false);

  // Lista base de categorías que se insertan automáticamente si la tabla está vacía.
  readonly defaultCategories: ReadonlyArray<string> = [
    // Categoría de entradas.
    'Appetizers',
    // Categoría de platos principales.
    'Main Courses',
    // Categoría de postres.
    'Desserts',
    // Categoría de bebidas.
    'Beverages',
    // Categoría de ensaladas.
    'Salads',
    // Categoría de sopas.
    'Soups',
    // Categoría de snacks.
    'Snacks',
    // Categoría de desayunos.
    'Breakfast',
    // Categoría de recetas vegetarianas.
    'Vegetarian',
    // Categoría de recetas veganas.
    'Vegan',
    // Categoría de recetas sin gluten.
    'Gluten-Free',
    // Categoría de recetas keto.
    'Keto',
    // Categoría de recetas paleo.
    'Paleo',
  ];

  // Inicializa la base de datos, abre conexión, crea esquema y siembra datos iniciales.
  async initializeDatabase(): Promise<void> {
    // Evita inicializar dos veces si ya está lista y existe conexión activa.
    if (this.ready$.value && this.db) {
      // Sale inmediatamente cuando ya existe una conexión funcional.
      return;
    }

    // Si ya hay una inicialización en curso, espera su resultado para evitar conflictos.
    if (this.initializingPromise) {
      // Reutiliza la misma promesa en lugar de abrir otra inicialización paralela.
      await this.initializingPromise;
      // Sale al completar la inicialización existente.
      return;
    }

    // Crea y registra la promesa de inicialización para serializar accesos concurrentes.
    this.initializingPromise = this.initializeDatabaseInternal();

    try {
      // Espera a que termine la inicialización real.
      await this.initializingPromise;
    } finally {
      // Limpia la referencia de bloqueo para permitir futuras inicializaciones si hicieran falta.
      this.initializingPromise = null;
    }
  }

  // Ejecuta el flujo real de inicialización de la base de datos.
  private async initializeDatabaseInternal(): Promise<void> {
    // Si durante la espera ya quedó lista, evita trabajo duplicado.
    if (this.ready$.value && this.db) {
      // Sale porque no es necesario repetir inicialización.
      return;
    }

    // En web asegura que el store de jeep-sqlite esté abierto antes de operar.
    if (Capacitor.getPlatform() === 'web') {
      await CapacitorSQLite.initWebStore();
    }

    // Verifica consistencia interna de conexiones administradas por el plugin.
    const consistency = await this.sqlite.checkConnectionsConsistency();
    // Comprueba si ya existe una conexión registrada con este nombre.
    const isConn = await this.sqlite.isConnection(this.dbName, false);

    // Si la conexión existe y está consistente, la recupera.
    if (consistency.result && isConn.result) {
      // Reutiliza conexión previamente creada para evitar duplicados.
      this.db = await this.sqlite.retrieveConnection(this.dbName, false);
    } else {
      // Si no existe, crea una conexión nueva con los parámetros definidos.
      this.db = await this.sqlite.createConnection(
        // Nombre de la base de datos.
        this.dbName,
        // No usa conexión cifrada compartida.
        false,
        // Tipo de cifrado deshabilitado.
        'no-encryption',
        // Versión del esquema.
        this.dbVersion,
        // No es conexión de solo lectura.
        false,
      );
    }

    // Abre la conexión a la base de datos.
    try {
      // Intenta abrir normalmente la base de datos.
      await this.db.open();
    } catch (error) {
      // En web, si la base local quedó inconsistente, intenta recuperar creando una base limpia.
      if (Capacitor.getPlatform() === 'web') {
        // Muestra información de diagnóstico en consola para facilitar soporte.
        console.warn('No se pudo abrir la base web; se intentará recrearla.', error);
        // Cierra la conexión actual si existe para liberar recursos antes de borrar.
        await this.sqlite.closeConnection(this.dbName, false).catch(() => undefined);
        // Borra la base local del store web para eliminar estado corrupto.
        await CapacitorSQLite.deleteDatabase({
          database: this.dbName,
          readonly: false,
        }).catch(() => undefined);
        // Crea una nueva conexión limpia con la misma configuración.
        this.db = await this.sqlite.createConnection(
          // Nombre de la base de datos.
          this.dbName,
          // No usa conexión cifrada compartida.
          false,
          // Tipo de cifrado deshabilitado.
          'no-encryption',
          // Versión del esquema.
          this.dbVersion,
          // No es conexión de solo lectura.
          false,
        );
        // Abre nuevamente la conexión ya recreada.
        await this.db.open();
      } else {
        // En plataformas nativas, propaga el error original para no ocultar fallos reales.
        throw error;
      }
    }
    // Crea las tablas y relaciones necesarias si aún no existen.
    await this.createSchema();
    // Inserta datos base si la base está vacía.
    await this.seedBaseData();

    // Si la app corre en navegador, persiste el estado en el almacenamiento web del plugin.
    // Persiste cambios en web de forma segura.
    await this.persistWebStore();

    // Marca el servicio como listo para usarse desde otras capas de la app.
    this.ready$.next(true);
  }

  // Expone un observable para que otros componentes sepan cuándo la base está lista.
  isReady(): Observable<boolean> {
    // Devuelve la versión observable del BehaviorSubject sin permitir mutaciones externas.
    return this.ready$.asObservable();
  }

  // Cierra la conexión activa y restablece el estado interno del servicio.
  async closeConnection(): Promise<void> {
    // Si no hay conexión activa, no hay nada por cerrar.
    if (!this.db) {
      // Sale sin hacer trabajo adicional.
      return;
    }

    // Cierra la conexión registrada por nombre.
    await this.sqlite.closeConnection(this.dbName, false);
    // Elimina la referencia local para evitar uso accidental.
    this.db = null;
    // Notifica que la base ya no está disponible.
    this.ready$.next(false);
  }

  // Ejecuta una sentencia SQL de escritura con parámetros opcionales.
  async run(sql: string, values: SqlValue[] = []): Promise<capSQLiteChanges> {
    // Garantiza obtener una conexión abierta antes de ejecutar.
    const database = await this.getOpenedConnection();
    // Ejecuta la sentencia SQL y captura el resultado de cambios.
    const result = await database.run(sql, values);

    // En web, sincroniza cambios al almacenamiento persistente.
    // Persiste cambios en web de forma segura.
    await this.persistWebStore();

    // Retorna el detalle de filas afectadas e id insertado.
    return result;
  }

  // Ejecuta una consulta SQL de lectura con parámetros opcionales.
  async query(sql: string, values: SqlValue[] = []): Promise<capSQLiteValues> {
    // Garantiza una conexión abierta antes de consultar.
    const database = await this.getOpenedConnection();
    // Devuelve el resultado de la consulta.
    return database.query(sql, values);
  }

  // Obtiene todas las categorías ordenadas alfabéticamente.
  async getCategories(): Promise<CategoryRecord[]> {
    // Ejecuta SELECT de categorías solicitando columnas relevantes.
    const result = await this.query(
      // Consulta SQL para leer categorías.
      'SELECT id, name, description FROM categories ORDER BY name ASC;',
    );
    // Retorna el arreglo de filas o un arreglo vacío si no hay resultados.
    return (result.values ?? []) as CategoryRecord[];
  }

  // Obtiene todos los ingredientes ordenados alfabéticamente.
  async getIngredients(): Promise<IngredientRecord[]> {
    // Ejecuta SELECT sobre la tabla de ingredientes.
    const result = await this.query('SELECT id, name FROM ingredients ORDER BY name ASC;');
    // Convierte y retorna los datos tipados.
    return (result.values ?? []) as IngredientRecord[];
  }

  // Obtiene todas las recetas ordenadas alfabéticamente por nombre.
  async getRecipes(): Promise<RecipeRecord[]> {
    // Ejecuta SELECT incluyendo alias para mapear time_required a timeRequired.
    const result = await this.query(
      // Consulta SQL para recuperar recetas.
      'SELECT id, name, subtitle, description, instructions, time_required AS timeRequired FROM recipes ORDER BY id DESC;',
    );
    // Retorna arreglo tipado de recetas.
    return (result.values ?? []) as RecipeRecord[];
  }

  // Crea una receta nueva en la base de datos y retorna su id generado.
  async createRecipe(input: CreateRecipeInput): Promise<number> {
    // Normaliza el nombre y valida que exista contenido mínimo.
    const name = (input.name ?? '').trim();

    // Si el nombre es vacío, lanza error de validación.
    if (!name) {
      throw new Error('El nombre de la receta es obligatorio');
    }

    // Inserta la receta usando parámetros para evitar interpolación manual.
    const result = await this.run(
      'INSERT INTO recipes (name, subtitle, description, instructions, time_required) VALUES (?, ?, ?, ?, ?);',
      [
        name,
        input.subtitle?.trim() || null,
        input.description?.trim() || null,
        input.instructions?.trim() || null,
        input.timeRequired ?? null,
      ],
    );

    // Obtiene el id insertado si existe, en otro caso retorna 0.
    return Number(result.changes?.lastId ?? 0);
  }

  // Actualiza una receta existente en la base de datos y retorna true si hubo cambios.
  async updateRecipe(input: UpdateRecipeInput): Promise<boolean> {
    // Valida el id de receta a modificar.
    if (!Number.isInteger(input.id) || input.id <= 0) {
      throw new Error('El id de la receta es inválido');
    }

    // Normaliza el nombre y valida que exista contenido mínimo.
    const name = (input.name ?? '').trim();

    // Si el nombre es vacío, lanza error de validación.
    if (!name) {
      throw new Error('El nombre de la receta es obligatorio');
    }

    // Ejecuta actualización parametrizada de los campos editables.
    const result = await this.run(
      'UPDATE recipes SET name = ?, subtitle = ?, description = ?, instructions = ?, time_required = ? WHERE id = ?;',
      [
        name,
        input.subtitle?.trim() || null,
        input.description?.trim() || null,
        input.instructions?.trim() || null,
        input.timeRequired ?? null,
        input.id,
      ],
    );

    // Retorna true cuando al menos una fila fue actualizada.
    return Number(result.changes?.changes ?? 0) > 0;
  }

  // Elimina una receta por id y retorna true si se eliminó al menos un registro.
  async deleteRecipe(id: number): Promise<boolean> {
    // Valida el identificador recibido.
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('El id de la receta es inválido');
    }

    // Ejecuta eliminación parametrizada de la receta.
    const result = await this.run('DELETE FROM recipes WHERE id = ?;', [id]);

    // Retorna true cuando se elimina al menos una fila.
    return Number(result.changes?.changes ?? 0) > 0;
  }

  // Obtiene todos los usuarios ordenados por nombre.
  async getUsuarios(): Promise<UsuarioRecord[]> {
    // Ejecuta SELECT de la tabla usuarios con sus campos principales.
    const result = await this.query(
      // Consulta SQL para recuperar usuarios.
      'SELECT id, nombre, rol, usuario, contrasena FROM usuarios ORDER BY nombre ASC;',
    );
    // Retorna arreglo tipado de usuarios.
    return (result.values ?? []) as UsuarioRecord[];
  }

  // Devuelve una conexión abierta y válida, inicializando la base si es necesario.
  private async getOpenedConnection(): Promise<SQLiteDBConnection> {
    // Si no hay conexión, intenta inicializarla.
    if (!this.db) {
      // Llama al flujo de inicialización completo.
      await this.initializeDatabase();
    }

    // Si aún no existe conexión tras inicializar, lanza error controlado.
    if (!this.db) {
      // Error explícito para facilitar diagnóstico.
      throw new Error('No fue posible abrir la conexión SQLite');
    }

    // Verifica que la conexión realmente esté abierta antes de usarla.
    const isOpen = await this.db.isDBOpen().catch(() => ({ result: false }));

    // Si la conexión está cerrada, intenta reabrirla en caliente.
    if (!isOpen.result) {
      try {
        // Intenta abrir la conexión existente.
        await this.db.open();
      } catch (error) {
        // Si falla, reinicia estado y rehace inicialización completa.
        console.warn('La conexión SQLite estaba cerrada; se recreará.', error);
        this.db = null;
        this.ready$.next(false);
        await this.initializeDatabase();
      }
    }

    // Si tras reintentos aún no hay conexión, corta con error controlado.
    if (!this.db) {
      throw new Error('No fue posible reabrir la conexión SQLite');
    }

    // Retorna la conexión abierta lista para uso.
    return this.db;
  }

  // Persiste la base en web con tolerancia a fallos transitorios del store.
  private async persistWebStore(): Promise<void> {
    // Si no es web, no requiere persistencia explícita en store.
    if (Capacitor.getPlatform() !== 'web') {
      // Sale sin realizar acciones adicionales.
      return;
    }

    try {
      // Intenta guardar la base en IndexedDB.
      await this.sqlite.saveToStore(this.dbName);
    } catch (error) {
      // Registra advertencia y reintenta tras reabrir el store web.
      console.warn('saveToStore falló; se reintentará tras initWebStore.', error);
      // Reinicializa el store web por si perdió estado interno.
      await CapacitorSQLite.initWebStore().catch(() => undefined);

      // Segundo intento de persistencia.
      await this.sqlite.saveToStore(this.dbName).catch((retryError) => {
        // Si vuelve a fallar, se registra y se continúa para no romper el flujo UI.
        console.error('No se pudo persistir la base en web store.', retryError);
      });
    }
  }

  // Crea todas las tablas y relaciones necesarias del esquema de datos.
  private async createSchema(): Promise<void> {
    // Obtiene la conexión activa para ejecutar DDL.
    const database = await this.getOpenedConnection();
    // Define un listado de sentencias SQL de creación de esquema.
    const statements = [
      // Activa las restricciones de llaves foráneas en SQLite.
      'PRAGMA foreign_keys = ON;',
      // Sentencia para crear tabla de categorías.
      `
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT
      );
      `,
      // Sentencia para crear tabla de ingredientes.
      `
      CREATE TABLE IF NOT EXISTS ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );
      `,
      // Sentencia para crear tabla de recetas.
      `
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        instructions TEXT,
        time_required INTEGER
      );
      `,
      // Sentencia para crear tabla de usuarios.
      `
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        rol TEXT NOT NULL,
        usuario TEXT NOT NULL UNIQUE,
        contrasena TEXT NOT NULL
      );
      `,
      // Sentencia para crear tabla intermedia receta-categoría (muchos a muchos).
      `
      CREATE TABLE IF NOT EXISTS recipe_categories (
        recipe_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        PRIMARY KEY (recipe_id, category_id),
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );
      `,
      // Sentencia para crear tabla intermedia receta-ingrediente con cantidad.
      `
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        recipe_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        quantity TEXT,
        PRIMARY KEY (recipe_id, ingredient_id),
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
      );
      `,
    ];

    // Ejecuta todas las sentencias de esquema en una sola operación.
    await database.execute(statements.join('\n'));

    // Asegura columnas nuevas en instalaciones que ya tenían la tabla recipes creada previamente.
    await this.ensureRecipeColumns();
  }

  // Agrega columnas faltantes en recipes para mantener compatibilidad con versiones anteriores.
  private async ensureRecipeColumns(): Promise<void> {
    // Consulta metadatos de columnas existentes en la tabla recipes.
    const columnsResult = await this.query('PRAGMA table_info(recipes);');
    // Convierte las columnas en un conjunto para verificar existencia rápidamente.
    const existingColumns = new Set(
      (columnsResult.values ?? []).map((column) => String(column.name)),
    );

    // Si no existe la columna subtitle, la agrega.
    if (!existingColumns.has('subtitle')) {
      await this.run('ALTER TABLE recipes ADD COLUMN subtitle TEXT;');
    }

    // Si no existe la columna description, la agrega.
    if (!existingColumns.has('description')) {
      await this.run('ALTER TABLE recipes ADD COLUMN description TEXT;');
    }
  }

  // Inserta datos base iniciales para evitar tablas vacías en la primera ejecución.
  private async seedBaseData(): Promise<void> {
    // Consulta cuántas categorías existen actualmente.
    const countResult = await this.query('SELECT COUNT(*) as total FROM categories;');
    // Convierte el resultado a número usando 0 como valor por defecto.
    const totalCategories = Number(countResult.values?.[0]?.total ?? 0);

    // Si ya hay categorías cargadas, no inserta datos duplicados.
    if (totalCategories > 0) {
      // Sale del método cuando no se requiere semilla inicial.
      return;
    }

    // Recorre el catálogo de categorías predefinidas.
    for (const categoryName of this.defaultCategories) {
      // Inserta cada categoría con descripción nula por defecto.
      await this.run(
        // SQL de inserción parametrizada para prevenir errores de formato.
        'INSERT INTO categories (name, description) VALUES (?, ?);',
        // Valores asociados a los placeholders de la sentencia.
        [categoryName, null],
      );
    }
  }
}