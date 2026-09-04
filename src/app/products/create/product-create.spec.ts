import { TestBed } from '@angular/core/testing';
import { ProductCreate } from './product-create';

describe('ProductCreate', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCreate],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProductCreate);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
