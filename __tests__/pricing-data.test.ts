import { PRICING_DATA } from "../lib/pricing-data";

describe("Pricing Data", () => {
  it("should contain unique tools", () => {
    const toolNames = PRICING_DATA.map((data) => data.tool);
    const uniqueToolNames = new Set(toolNames);
    expect(toolNames.length).toBe(uniqueToolNames.size);
  });

  it("should have valid URLs", () => {
    PRICING_DATA.forEach((data) => {
      expect(data.url.startsWith("http")).toBe(true);
    });
  });

  it("should have valid plan data", () => {
    PRICING_DATA.forEach((data) => {
      data.plans.forEach((plan) => {
        expect(plan.pricePerUser).toBeGreaterThanOrEqual(0);
        expect(plan.features.length).toBeGreaterThan(0);
        
        if (plan.minSeats && plan.maxSeats) {
          expect(plan.maxSeats).toBeGreaterThanOrEqual(plan.minSeats);
        }
      });
    });
  });

  it("should have valid API pricing if provided", () => {
    PRICING_DATA.forEach((data) => {
      if (data.apiPricing) {
        expect(data.apiPricing.inputPer1MTokens).toBeGreaterThanOrEqual(0);
        expect(data.apiPricing.outputPer1MTokens).toBeGreaterThanOrEqual(0);
        expect(data.apiPricing.model.length).toBeGreaterThan(0);
      }
    });
  });
});
