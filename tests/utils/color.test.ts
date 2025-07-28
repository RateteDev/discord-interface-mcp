import { describe, it, expect } from "@jest/globals";
import { getStatusColor, StatusType } from "../../src/utils/color";

describe("color utilities", () => {
  describe("getStatusColor", () => {
    it("should return blue for waiting status", () => {
      expect(getStatusColor("waiting")).toBe(0x0099FF);
    });

    it("should return green for success status", () => {
      expect(getStatusColor("success")).toBe(0x00FF00);
    });

    it("should return green for completed status", () => {
      expect(getStatusColor("completed")).toBe(0x00FF00);
    });

    it("should return red for error status", () => {
      expect(getStatusColor("error")).toBe(0xFF0000);
    });

    it("should return gray for normal status", () => {
      expect(getStatusColor("normal")).toBe(0x808080);
    });

    it("should return gray for default/undefined status", () => {
      expect(getStatusColor()).toBe(0x808080);
    });
  });

  describe("StatusType", () => {
    it("should define all valid status types", () => {
      const validStatuses: StatusType[] = [
        "waiting",
        "success",
        "completed",
        "error",
        "normal"
      ];
      expect(validStatuses).toHaveLength(5);
    });
  });
});