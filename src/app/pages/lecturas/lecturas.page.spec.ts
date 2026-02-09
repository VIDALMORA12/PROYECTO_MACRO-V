import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LecturasPage } from './lecturas.page';

describe('LecturasPage', () => {
  let component: LecturasPage;
  let fixture: ComponentFixture<LecturasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LecturasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
