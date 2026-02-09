import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MacroMedidorPage } from './macro-medidor.page';

describe('MacroMedidorPage', () => {
  let component: MacroMedidorPage;
  let fixture: ComponentFixture<MacroMedidorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MacroMedidorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
