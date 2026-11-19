import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { totalConIva } from "./order.precios";

describe("totalConIva", () => {
  it("incluye IVA al 21% sobre todas las unidades", () => {
    assert.equal(totalConIva([{ unitPrice: 100, quantity: 2 }]), 242);
    assert.equal(
      totalConIva([
        { unitPrice: 100, quantity: 1 },
        { unitPrice: 50, quantity: 2 },
      ]),
      242,
    );
  });

  it("redondea el total a centavos", () => {
    assert.equal(totalConIva([{ unitPrice: 0.5, quantity: 1 }]), 0.61);
  });
});
