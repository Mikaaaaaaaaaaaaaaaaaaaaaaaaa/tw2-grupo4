import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cumplePoliticaPassword } from "./password-policy";

describe("cumplePoliticaPassword", () => {
  it("acepta contraseñas largas con mayúsculas, minúsculas y dos números", () => {
    assert.equal(cumplePoliticaPassword("ClaveFuerte12"), true);
  });

  it("rechaza contraseñas que incumplen cada requisito", () => {
    assert.equal(cumplePoliticaPassword("Clave12"), false);
    assert.equal(cumplePoliticaPassword("ClaveFuer1"), false);
    assert.equal(cumplePoliticaPassword("clavefuerte12"), false);
    assert.equal(cumplePoliticaPassword("CLAVEFUERTE12"), false);
  });
});
