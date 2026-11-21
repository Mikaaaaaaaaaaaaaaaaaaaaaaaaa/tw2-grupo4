import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { Login } from './login';
import { LoginService } from '../../services/login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requires 8 characters, two numbers, uppercase and lowercase letters', () => {
    const password = component.formularioRegistro.get('password')!;

    password.setValue('Abcde1');
    expect(password.hasError('minlength')).toBe(true);

    password.setValue('Abcdefg1');
    expect(password.hasError('pattern')).toBe(true);

    password.setValue('abcdef12');
    expect(password.hasError('pattern')).toBe(true);

    password.setValue('ABCDEF12');
    expect(password.hasError('pattern')).toBe(true);

    password.setValue('Abcdef12');
    expect(password.valid).toBe(true);
  });

  it('blocks registration and reports when confirmation differs', () => {
    const registrar = vi.spyOn(TestBed.inject(LoginService), 'registrar');
    component.formularioRegistro.setValue({
      nombre: 'Ana',
      apellido: 'Pérez',
      direccion: 'Calle 1',
      email: 'ana@example.com',
      password: 'Abcdef12',
      repetirPassword: 'Abcdef13',
    });
    component.formularioRegistro.get('repetirPassword')?.markAsTouched();

    expect(component.formularioRegistro.invalid).toBe(true);
    expect(component.tienePasswordDistinta()).toBe(true);

    component.enviarRegistro();

    expect(registrar).not.toHaveBeenCalled();
  });

  it('shows password requirements in the registration form', () => {
    component.cambiarPestana('register');
    fixture.detectChanges();

    const form = fixture.nativeElement as HTMLElement;
    expect(form.textContent).toContain('mínimo 8 caracteres');
    expect(form.textContent).toContain('al menos 2 números');
    expect(form.querySelector('#reg_repetir_password')).not.toBeNull();
  });
});
