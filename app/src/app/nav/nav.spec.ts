import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Nav } from './nav';
import { provideRouter } from '@angular/router';
import { LoginService } from '../services/login';

describe('Nav', () => {
  let component: Nav;
  let fixture: ComponentFixture<Nav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nav],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Nav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens the login modal when a guest selects sign in', () => {
    const loginService = TestBed.inject(LoginService);
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      '.sesion-btn',
    ) as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(loginService.modalLoginAbierto()).toBe(true);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]'),
    ).not.toBeNull();
  });
});
