export class Perdidas {
    private id_perdida: number;
    private id_ciclo: number;
    private mes_anio: string;
    private valor_perdida: number;

    constructor(id_perdida: number, id_ciclo: number, mes_anio: string, valor_perdida: number) {
        this.id_perdida = id_perdida;
        this.id_ciclo = id_ciclo;
        this.mes_anio = mes_anio;
        this.valor_perdida = valor_perdida;
    }

    getIdPerdida(): number {
        return this.id_perdida;
    }

    getIdCiclo(): number {
        return this.id_ciclo;
    }
    getMesAnio(): string {
        return this.mes_anio;
    }
    getValorPerdida(): number {
        return this.valor_perdida;
    }

    setIdPerdida(id_perdida: number): void {
        this.id_perdida = id_perdida;
    }
    setIdCiclo(id_ciclo: number): void {
        this.id_ciclo = id_ciclo;
    }
    setMesAnio(mes_anio: string): void {
        this.mes_anio = mes_anio;
    }
    setValorPerdida(valor_perdida: number): void {
        this.valor_perdida = valor_perdida;
    }
    

}
