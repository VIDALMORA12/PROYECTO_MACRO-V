export class Lectura {

    private id_lectura: number;
    private valor_lectura: number;
    private fecha_lectura: string;
    private novedad_estado: string;
    private id_macro_foto: number;
    private id_usuario:string;

    constructor(id_lectura: number, valor_lectura: number, fecha_lectura: string, novedad_estado: string, id_macro_foto: number, id_usuario:string) {
        this.id_lectura = id_lectura;
        this.valor_lectura = valor_lectura;
        this.fecha_lectura = fecha_lectura;
        this.novedad_estado = novedad_estado;
        this.id_macro_foto = id_macro_foto;
        this.id_usuario = id_usuario;
    }
    getIdLectura(): number {
        return this.id_lectura;
    }   
    getValorLectura(): number {
        return this.valor_lectura;
    }
    getFechaLectura(): string {
        return this.fecha_lectura;
    }
    getNovedadEstado(): string {
        return this.novedad_estado;
    }
    getIdMacroFoto(): number {
        return this.id_macro_foto;
    }
    getIdUsuario(): string {
        return this.id_usuario;
    }
    setIdLectura(id_lectura: number): void {
        this.id_lectura = id_lectura;
    }
    setValorLectura(valor_lectura: number): void {
        this.valor_lectura = valor_lectura;
    }
    setFechaLectura(fecha_lectura: string): void {
        this.fecha_lectura = fecha_lectura;
    }
    setNovedadEstado(novedad_estado: string): void {
        this.novedad_estado = novedad_estado;
    }
    setIdMacroFoto(id_macro_foto: number): void {
        this.id_macro_foto = id_macro_foto;
    }
    setIdUsuario(id_usuario: string): void {
        this.id_usuario = id_usuario;
    }
    
}
