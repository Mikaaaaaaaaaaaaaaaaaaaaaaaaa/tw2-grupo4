import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from '../../services/login';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  selector: 'app-restablecer',
  templateUrl: './restablecer.html',
})
export class Restablecer {
  private auth = inject(LoginService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  public token = this.route.snapshot.queryParamMap.get('token') ?? '';
  public error = '';
  public listo = false;

  public formulario = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', [Validators.required]],
    },
    { validators: (g: AbstractControl) => (g.get('password')?.value === g.get('confirmar')?.value ? null : { noCoinciden: true }) },
  );

  public enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.error = '';
    this.auth.restablecer(this.token, this.formulario.value.password!).subscribe({
      next: () => (this.listo = true),
      error: (e) => (this.error = e.error?.message ?? 'No se pudo conectar con el servidor.'),
    });
  }
}
