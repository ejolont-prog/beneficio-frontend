import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEstadoTransporteComponent } from './dialog-estado-transporte.component';

describe('DialogEstadoTransporteComponent', () => {
  let component: DialogEstadoTransporteComponent;
  let fixture: ComponentFixture<DialogEstadoTransporteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEstadoTransporteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogEstadoTransporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
