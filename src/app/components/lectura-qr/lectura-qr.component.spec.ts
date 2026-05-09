import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LecturaQrComponent } from './lectura-qr.component';

describe('LecturaQrComponent', () => {
  let component: LecturaQrComponent;
  let fixture: ComponentFixture<LecturaQrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LecturaQrComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LecturaQrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
