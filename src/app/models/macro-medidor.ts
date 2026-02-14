export class MacroMedidor {
    private id_macro_medidor: number;
    private id_ciclo: number;
    private nombre: string;
    private direccion: string;
    private sig_coord: string;
    private tipo_instalacion: string;
    
    constructor(id_macro_medidor: number, id_ciclo: number, nombre: string, direccion: string, sig_coord: string, tipo_instalacion: string) {
        this.id_macro_medidor = id_macro_medidor;
        this.id_ciclo = id_ciclo;
        this.nombre = nombre;
        this.direccion = direccion;
        this.sig_coord = sig_coord;
        this.tipo_instalacion = tipo_instalacion;
    }

    getIdMacroMedidor(): number {
        return this.id_macro_medidor;
    }

    getIdCiclo(): number {
        return this.id_ciclo;
    }

    getNombre(): string {
        return this.nombre;
    }

    getDireccion(): string {
        return this.direccion;
    }

    getSigCoord(): string {
        return this.sig_coord;
    }

    getTipoInstalacion(): string {
        return this.tipo_instalacion;
    }

    setIdMacroMedidor(id_macro_medidor: number): void {
        this.id_macro_medidor = id_macro_medidor;
    }
    setIdCiclo(id_ciclo: number): void {
        this.id_ciclo = id_ciclo;
    }
    setNombre(nombre: string): void {
        this.nombre = nombre;
    }
    setDireccion(direccion: string): void {
        this.direccion = direccion;
    }
    setSigCoord(sig_coord: string): void { 
        this.sig_coord = sig_coord;
    }
    setTipoInstalacion(tipo_instalacion: string): void {
        this.tipo_instalacion = tipo_instalacion;
    }
    
}