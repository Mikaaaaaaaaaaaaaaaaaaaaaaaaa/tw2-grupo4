import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { LoginService } from '../../services/login';

function validarCoincidenciaPassword(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const repetirPassword = control.get('repetirPassword')?.value;

  return repetirPassword && password !== repetirPassword ? { passwordMismatch: true } : null;
}

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
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=(?:.*\d){2,}).+$/),
        ],
      ],
      repetirPassword: ['', [Validators.required]],
    }, { validators: validarCoincidenciaPassword });
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
    const { nombre, apellido, direccion, email, password } = this.formularioRegistro.value;
    this.login.registrar({ nombre, apellido, direccion, email, password }).subscribe({
      next: (u) => this.autenticado.emit(u.nombre),
      error: (e) => (this.error = e.error?.message ?? 'No se pudo conectar con el servidor.'),
    });
  }

  public tienePasswordDistinta(): boolean {
    return (
      this.formularioRegistro.hasError('passwordMismatch') &&
      !!this.formularioRegistro.get('repetirPassword')?.touched
    );
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
