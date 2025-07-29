import { describe, it, expect } from 'bun:test';
import { getStatusColor, type StatusType } from '../../src/utils/color';

describe('color utilities', () => {
  describe('getStatusColor', () => {
    it('should return blue for waiting status', () => {
      expect(getStatusColor('waiting')).toBe(0x0099ff);
    });

    it('should return green for success status', () => {
      expect(getStatusColor('success')).toBe(0x00ff00);
    });

    it('should return green for completed status', () => {
      expect(getStatusColor('completed')).toBe(0x00ff00);
    });

    it('should return red for error status', () => {
      expect(getStatusColor('error')).toBe(0xff0000);
    });

    it('should return Claude orange for normal status', () => {
      expect(getStatusColor('normal')).toBe(0xf5682a);
    });

    it('should return Claude orange for default/undefined status', () => {
      expect(getStatusColor()).toBe(0xf5682a);
    });
  });

  describe('StatusType', () => {
    it('should define all valid status types', () => {
      const validStatuses: StatusType[] = [
        'waiting',
        'success',
        'completed',
        'error',
        'normal',
      ];
      expect(validStatuses).toHaveLength(5);
    });
  });
});
