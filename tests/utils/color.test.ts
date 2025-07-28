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

    it("should return Claude orange for normal status", () => {
      expect(getStatusColor("normal")).toBe(0xF5682A);
    });

    it("should return Claude orange for default/undefined status", () => {
      expect(getStatusColor()).toBe(0xF5682A);
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