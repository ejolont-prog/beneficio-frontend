import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDetalleAgricultorComponent } from './dialog-detalle-agricultor.component';

describe('DialogDetalleAgricultorComponent', () => {
  let component: DialogDetalleAgricultorComponent;
  let fixture: ComponentFixture<DialogDetalleAgricultorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogDetalleAgricultorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogDetalleAgricultorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
