import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from '../../services/login';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private login = inject(LoginService);

  // pestaña activa: 'login' o 'register'.
  public pestana: 'login' | 'register' | 'recuperar' = 'login';

  public formularioRecuperar: FormGroup;
  public mensaje = '';

  public formularioLogin: FormGroup;
  public formularioRegistro: FormGroup;

  // mensaje de error que viene del backend
  public error = '';

  // eventos hacia el componente padre
  @Output() public cerrar = new EventEmitter<void>();
  @Output() public autenticado = new EventEmitter<string>(); // emite el nombre del usuario

  public constructor(private fb: FormBuilder) {
    this.formularioLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      recordar: [true],
    });

    this.formularioRecuperar = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.formularioRegistro = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  public cambiarPestana(pestana: 'login' | 'register' | 'recuperar'): void {
    this.pestana = pestana;
    this.error = '';
    this.mensaje = '';
  }

  public enviarLogin(): void {
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      return;
    }
    this.error = '';
    const { email, password } = this.formularioLogin.value;
    this.login.login(email, password).subscribe({
      next: (u) => this.autenticado.emit(u.nombre),
      error: (e) => (this.error = e.error?.message ?? 'No se pudo conectar con el servidor.'),
    });
  }

  public enviarRegistro(): void {
    if (this.formularioRegistro.invalid) {
      this.formularioRegistro.markAllAsTouched();
      return;
    }
    this.error = '';
    this.login.registrar(this.formularioRegistro.value).subscribe({
      next: (u) => this.autenticado.emit(u.nombre),
      error: (e) => (this.error = e.error?.message ?? 'No se pudo conectar con el servidor.'),
    });
  }

  public cerrarModal(): void {
    this.cerrar.emit();
  }

  // ayuda para mostrar errores solo cuando el campo fue clickeado
  public tieneError(formulario: FormGroup, campo: string): boolean {
    const control = formulario.get(campo);
    return !!control && control.invalid && control.touched;
  }

  public enviarRecuperar(): void {
    if (this.formularioRecuperar.invalid) {
      this.formularioRecuperar.markAllAsTouched();
      return;
    }
    this.error = '';
    this.mensaje = '';
    this.login.recuperar(this.formularioRecuperar.value.email).subscribe({
      next: (r) => (this.mensaje = r.message),
      error: (e) => (this.error = e.error?.message ?? 'No se pudo conectar con el servidor.'),
    });
  }
}
