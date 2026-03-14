import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite } from '@capacitor-community/sqlite';
import { defineCustomElements as defineJeepSqliteCustomElements } from 'jeep-sqlite/loader';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Función para inicializar el motor SQLite en la Web
const initializeWebSQLite = async (): Promise<void> => {
  const platform = Capacitor.getPlatform();
  
  if (platform === 'web') {
    defineJeepSqliteCustomElements(window);

    const jeepSqlite = document.createElement('jeep-sqlite');
    jeepSqlite.setAttribute('autoSave', 'true'); 
    document.body.appendChild(jeepSqlite);

    await customElements.whenDefined('jeep-sqlite');
    
    // FORZADO: Esperamos y re-intentamos la inicialización
    try {
      await CapacitorSQLite.initWebStore();
      console.log('Almacén SQLite abierto');
    } catch (err) {
      console.error('Re-intentando inicialización...', err);
      // Si falla, esperamos 1 segundo y volvemos a intentar antes de arrancar la app
      await new Promise(resolve => setTimeout(resolve, 1000));
      await CapacitorSQLite.initWebStore();
    }
  }
};

// Función principal de arranque
const bootstrap = async (): Promise<void> => {
  await initializeWebSQLite();
  
  // Añade este pequeño retraso antes del bootstrapApplication
  // Esto le da tiempo al navegador de registrar el componente <jeep-sqlite>
  setTimeout(async () => {
    await bootstrapApplication(AppComponent, {
      providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideIonicAngular(),
        provideRouter(routes, withPreloading(PreloadAllModules)),
      ],
    });
  }, 1000); // 1 segundo de espera
};
// Ejecutar el arranque
bootstrap().catch((error: unknown) => {
  console.error('Error fatal al inicializar la aplicación', error);
});