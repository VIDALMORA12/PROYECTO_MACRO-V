export class Ciclo {

    private id_ciclo: number;
    private descripcion: string;
    private periodicidad: string;

    constructor(id_ciclo: number, descripcion: string, periodicidad: string) {
        this.id_ciclo = id_ciclo;
        this.descripcion = descripcion;
        this.periodicidad = periodicidad;
    }
    getIdCiclo(): number {
        return this.id_ciclo;
    }
    getDescripcion(): string {
        return this.descripcion;
    }
    getPeriodicidad(): string {
        return this.periodicidad;
    }
    setIdCiclo(id_ciclo: number): void {
        this.id_ciclo = id_ciclo;
    }
    setDescripcion(descripcion: string): void {
        this.descripcion = descripcion;
    }
    setPeriodicidad(periodicidad: string): void {
        this.periodicidad = periodicidad;
    }
    
}
