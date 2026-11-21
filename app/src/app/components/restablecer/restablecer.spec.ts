import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Restablecer } from './restablecer';

describe('Restablecer', () => {
  let fixture: ComponentFixture<Restablecer>;
  let component: Restablecer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Restablecer],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Restablecer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('aplica los requisitos de contraseña del registro', () => {
    const password = component.formulario.controls.password;

    password.setValue('Abcde1');
    expect(password.hasError('minlength')).toBe(true);

    password.setValue('Abcdefg1');
    expect(password.hasError('pattern')).toBe(true);

    password.setValue('abcdef12');
    expect(password.hasError('pattern')).toBe(true);

    password.setValue('ABCDEF12');
    expect(password.hasError('pattern')).toBe(true);

    password.setValue('Abcdef12');
    component.formulario.controls.confirmar.setValue('Abcdef12');
    expect(component.formulario.valid).toBe(true);
  });

  it('muestra la política y exige que ambas contraseñas coincidan', () => {
    const password = component.formulario.controls.password;
    const confirmar = component.formulario.controls.confirmar;
    password.setValue('Abcdef12');
    confirmar.setValue('Abcdef13');
    confirmar.markAsTouched();
    fixture.detectChanges();

    expect(component.formulario.hasError('noCoinciden')).toBe(true);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'al menos 2 números',
    );
  });
});
