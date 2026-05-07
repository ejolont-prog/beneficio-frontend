import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEstadoTransportistaComponent } from './dialog-estado-transportista.component';

describe('DialogEstadoTransportistaComponent', () => {
  let component: DialogEstadoTransportistaComponent;
  let fixture: ComponentFixture<DialogEstadoTransportistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEstadoTransportistaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogEstadoTransportistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
