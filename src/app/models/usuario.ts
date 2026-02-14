export class Usuario {
 
  private _nombre: string;
  private _rol: string;
  private _usuario: string;
  private _contrasena: string;

 
  constructor(nombre: string, rol: string, usuario: string, contrasena: string) {
    this._nombre = nombre;
    this._rol = rol;
    this._usuario = usuario;
    this._contrasena = contrasena;
  }

 
  get nombre(): string {
    return this._nombre;
  }

  get rol(): string {
    return this._rol;
  }

  get usuario(): string {
    return this._usuario;
  }

  
  set nombre(nuevoNombre: string) {
    if (nuevoNombre.length > 0) {
      this._nombre = nuevoNombre;
    } else {
      console.error("El nombre no puede estar vacío");
    }
  }

  set rol(nuevoRol: string) {
    
    if (nuevoRol === 'Ingeniero' || nuevoRol === 'Operativo') {
      this._rol = nuevoRol;
    }
  }

  set usuario(nuevoUsuario: string) {
    this._usuario = nuevoUsuario;
  }

  set contrasena(nuevaClave: string) {
    if (nuevaClave.length >= 6) {
      this._contrasena = nuevaClave;
    }
  }
}
