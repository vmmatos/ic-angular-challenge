import { TestBed } from '@angular/core/testing';
import { ProductOverview } from './product-overview';

describe('ProductOverview', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductOverview],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProductOverview);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
