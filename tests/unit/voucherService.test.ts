import { jest } from "@jest/globals";
import voucherService from "../../src/services/voucherService.js";
import voucherRepository from "../../src/repositories/voucherRepository.js";

describe("voucherService test suite", () => {
  const voucher = {
    id: 1,
    code: "code",
    discount: __generateValue(1, 100),
    used: false,
  };
  const amount = 100;

  it("given a voucher code equals to another, return conflict error", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(voucher);
    await expect(
      voucherService.createVoucher(voucher.code, voucher.discount)
    ).rejects.toEqual({ type: "conflict", message: "Voucher already exist." });
  });

  it("create a voucher", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(null);
    jest
      .spyOn(voucherRepository, "createVoucher")
      .mockResolvedValueOnce(voucher);
    await voucherService.createVoucher(voucher.code, voucher.discount);
    expect(voucherRepository.createVoucher).toBeCalledTimes(1);
  });

  it("given a voucher code that doesn't exist, return not found error", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(null);
    await expect(
      voucherService.applyVoucher(voucher.code, amount)
    ).rejects.toEqual({ type: "conflict", message: "Voucher does not exist." });
  });

  it("apply voucher", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(voucher);
    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockResolvedValueOnce({ ...voucher, used: true });
    const finalAmount = amount - amount * (voucher.discount / 100);
    const result = await voucherService.applyVoucher(voucher.code, amount);
    expect(result).toStrictEqual({
      amount,
      discount: voucher.discount,
      finalAmount,
      applied: true,
    });
  });
});

function __generateValue(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
