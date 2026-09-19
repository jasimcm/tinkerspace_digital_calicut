import { getCardMetrics } from './cardMetrics';

describe('getCardMetrics', () => {
  it('keeps card details to one compact line while preserving the image area', () => {
    const metrics = getCardMetrics(180);

    expect(metrics.infoHeight).toBeGreaterThanOrEqual(40);
    expect(metrics.infoHeight).toBeLessThanOrEqual(56);
    expect(metrics.imageHeight).toBeGreaterThan(metrics.infoHeight);
    expect(metrics.infoPaddingX).toBeLessThanOrEqual(12);
  });
});
