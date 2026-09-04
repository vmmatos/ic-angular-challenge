import { TestBed } from '@angular/core/testing';
import { ProductDetail } from './product-detail';

describe('ProductDetail', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetail],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProductDetail);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
