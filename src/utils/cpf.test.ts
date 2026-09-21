import { describe, expect, it } from "bun:test";
import { isValidCPF } from "./cpf";

describe("isValidCPF", () => {
  it("deve validar CPFs válidos conhecidos", () => {
    // CPFs válidos com e sem formatação
    expect(isValidCPF("52998224725")).toBe(true);
    expect(isValidCPF("529.982.247-25")).toBe(true);
    expect(isValidCPF("123.456.789-09")).toBe(true);
    expect(isValidCPF("12345678909")).toBe(true);
  });

  it("deve rejeitar CPFs com dígitos repetidos", () => {
    expect(isValidCPF("000.000.000-00")).toBe(false);
    expect(isValidCPF("11111111111")).toBe(false);
    expect(isValidCPF("22222222222")).toBe(false);
    expect(isValidCPF("99999999999")).toBe(false);
  });

  it("deve rejeitar CPFs com tamanho incorreto", () => {
    expect(isValidCPF("123")).toBe(false);
    expect(isValidCPF("1234567890")).toBe(false);
    expect(isValidCPF("123456789012")).toBe(false);
    expect(isValidCPF("")).toBe(false);
  });

  it("deve rejeitar CPFs com dígitos verificadores inválidos", () => {
    expect(isValidCPF("52998224720")).toBe(false); // último dígito errado
    expect(isValidCPF("52998224715")).toBe(false); // penúltimo dígito errado
  });
});
