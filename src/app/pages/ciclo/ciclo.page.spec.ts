import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CicloPage } from './ciclo.page';

describe('CicloPage', () => {
  let component: CicloPage;
  let fixture: ComponentFixture<CicloPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CicloPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
