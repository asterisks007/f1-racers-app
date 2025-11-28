/**
 * Property-based tests for navigation parameter validation
 * Feature: f1-racers-mobile-app
 */

import * as fc from 'fast-check';
import { validateNavigationParams, isValidNavigationParams } from './validation';
import { RootStackParamList } from '../models';

describe('Navigation Property Tests', () => {
  /**
   * Feature: f1-racers-mobile-app, Property 6: Navigation parameter passing
   * Validates: Requirements 4.1
   * 
   * For any driver card that is tapped, the navigation to the detail screen
   * should include the correct driver ID as a parameter.
   */
  describe('Property 6: Navigation parameter passing', () => {
    it('should validate correct DriverDetail parameters with any valid driver ID', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          (driverId) => {
            // Property: Any non-empty string should be a valid driver ID parameter
            const params: RootStackParamList['DriverDetail'] = { driverId };
            
            // Should not throw
            expect(() => {
              validateNavigationParams('DriverDetail', params);
            }).not.toThrow();
            
            // Should return true
            const result = validateNavigationParams('DriverDetail', params);
            expect(result).toBe(true);
            
            // Type guard should also return true
            expect(isValidNavigationParams('DriverDetail', params)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject DriverDetail parameters with empty driver ID', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', '   ', '\t', '\n', '  \t\n  '),
          (emptyId) => {
            // Property: Empty or whitespace-only driver IDs should be rejected
            const params = { driverId: emptyId };
            
            // Should throw error
            expect(() => {
              validateNavigationParams('DriverDetail', params);
            }).toThrow('driverId cannot be empty');
            
            // Type guard should return false
            expect(isValidNavigationParams('DriverDetail', params)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject DriverDetail parameters with non-string driver ID', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer(),
            fc.boolean(),
            fc.constant(null),
            fc.constant(undefined),
            fc.array(fc.string()),
            fc.object()
          ),
          (invalidId) => {
            // Property: Non-string driver IDs should be rejected
            const params = { driverId: invalidId } as any;
            
            // Should throw error
            expect(() => {
              validateNavigationParams('DriverDetail', params);
            }).toThrow();
            
            // Type guard should return false
            expect(isValidNavigationParams('DriverDetail', params)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate DriverList parameters (undefined)', () => {
      // Property: DriverList screen should accept undefined parameters
      expect(() => {
        validateNavigationParams('DriverList', undefined);
      }).not.toThrow();
      
      const result = validateNavigationParams('DriverList', undefined);
      expect(result).toBe(true);
      
      expect(isValidNavigationParams('DriverList', undefined)).toBe(true);
    });

    it('should reject DriverList parameters when not undefined', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.object(),
            fc.array(fc.anything()),
            fc.constant(null)
          ),
          (invalidParams) => {
            // Property: DriverList should only accept undefined
            expect(() => {
              validateNavigationParams('DriverList', invalidParams as any);
            }).toThrow();
            
            expect(isValidNavigationParams('DriverList', invalidParams)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle UUID-formatted driver IDs correctly', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          (driverId) => {
            // Property: UUID-formatted IDs should be valid
            const params: RootStackParamList['DriverDetail'] = { driverId };
            
            expect(() => {
              validateNavigationParams('DriverDetail', params);
            }).not.toThrow();
            
            expect(validateNavigationParams('DriverDetail', params)).toBe(true);
            expect(isValidNavigationParams('DriverDetail', params)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle driver IDs with special characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (driverId) => {
            // Property: Driver IDs with special characters should be valid as long as not empty
            const params: RootStackParamList['DriverDetail'] = { driverId };
            
            expect(() => {
              validateNavigationParams('DriverDetail', params);
            }).not.toThrow();
            
            expect(validateNavigationParams('DriverDetail', params)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject DriverDetail parameters with missing driverId field', () => {
      // Property: Parameters without driverId field should be rejected
      const params = {} as any;
      
      expect(() => {
        validateNavigationParams('DriverDetail', params);
      }).toThrow('Expected string');
      
      expect(isValidNavigationParams('DriverDetail', params)).toBe(false);
    });

    it('should reject DriverDetail parameters with null driverId', () => {
      // Property: null driver ID should be rejected
      const params = { driverId: null } as any;
      
      expect(() => {
        validateNavigationParams('DriverDetail', params);
      }).toThrow('Expected string');
      
      expect(isValidNavigationParams('DriverDetail', params)).toBe(false);
    });

    it('should reject DriverDetail parameters with undefined driverId', () => {
      // Property: undefined driver ID should be rejected
      const params = { driverId: undefined } as any;
      
      expect(() => {
        validateNavigationParams('DriverDetail', params);
      }).toThrow('Expected string');
      
      expect(isValidNavigationParams('DriverDetail', params)).toBe(false);
    });

    it('should handle numeric string driver IDs', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          (numericId) => {
            // Property: Numeric strings should be valid driver IDs
            const driverId = numericId.toString();
            const params: RootStackParamList['DriverDetail'] = { driverId };
            
            expect(() => {
              validateNavigationParams('DriverDetail', params);
            }).not.toThrow();
            
            expect(validateNavigationParams('DriverDetail', params)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve driver ID value through validation', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          (driverId) => {
            // Property: Validation should not modify the driver ID
            const params: RootStackParamList['DriverDetail'] = { driverId };
            const originalId = params.driverId;
            
            validateNavigationParams('DriverDetail', params);
            
            // Driver ID should remain unchanged
            expect(params.driverId).toBe(originalId);
            expect(params.driverId).toBe(driverId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle very long driver IDs', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 100, maxLength: 500 }).filter(s => s.trim().length > 0),
          (longId) => {
            // Property: Very long driver IDs should still be valid
            const params: RootStackParamList['DriverDetail'] = { driverId: longId };
            
            expect(() => {
              validateNavigationParams('DriverDetail', params);
            }).not.toThrow();
            
            expect(validateNavigationParams('DriverDetail', params)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle driver IDs with unicode characters', () => {
      fc.assert(
        fc.property(
          fc.fullUnicodeString({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (unicodeId) => {
            // Property: Unicode driver IDs should be valid
            const params: RootStackParamList['DriverDetail'] = { driverId: unicodeId };
            
            expect(() => {
              validateNavigationParams('DriverDetail', params);
            }).not.toThrow();
            
            expect(validateNavigationParams('DriverDetail', params)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Edge case tests for navigation parameter validation
   */
  describe('Edge Cases', () => {
    it('should validate typical driver ID formats', () => {
      const validIds = [
        '1',
        'driver-123',
        'lewis-hamilton',
        'max_verstappen',
        'charles.leclerc',
        '550e8400-e29b-41d4-a716-446655440000', // UUID
        'DRV001',
        'f1-driver-2024',
      ];

      validIds.forEach(driverId => {
        const params: RootStackParamList['DriverDetail'] = { driverId };
        
        expect(() => {
          validateNavigationParams('DriverDetail', params);
        }).not.toThrow();
        
        expect(validateNavigationParams('DriverDetail', params)).toBe(true);
        expect(isValidNavigationParams('DriverDetail', params)).toBe(true);
      });
    });

    it('should reject invalid driver ID formats', () => {
      const invalidIds = [
        '',
        '   ',
        '\t',
        '\n',
        '  \t\n  ',
      ];

      invalidIds.forEach(driverId => {
        const params = { driverId };
        
        expect(() => {
          validateNavigationParams('DriverDetail', params);
        }).toThrow();
        
        expect(isValidNavigationParams('DriverDetail', params)).toBe(false);
      });
    });

    it('should reject non-object parameters for DriverDetail', () => {
      const invalidParams = [
        'string',
        123,
        true,
        null,
        undefined,
        [],
      ];

      invalidParams.forEach(params => {
        expect(() => {
          validateNavigationParams('DriverDetail', params as any);
        }).toThrow();
        
        expect(isValidNavigationParams('DriverDetail', params)).toBe(false);
      });
    });

    it('should handle parameters with extra fields for DriverDetail', () => {
      const params = {
        driverId: 'valid-id',
        extraField: 'should be ignored',
        anotherField: 123,
      } as any;

      // Should still validate successfully (extra fields are ignored)
      expect(() => {
        validateNavigationParams('DriverDetail', params);
      }).not.toThrow();
      
      expect(validateNavigationParams('DriverDetail', params)).toBe(true);
    });

    it('should throw descriptive error for invalid screen name', () => {
      expect(() => {
        validateNavigationParams('InvalidScreen' as any, undefined);
      }).toThrow('Unknown screen name');
    });

    it('should handle case sensitivity in driver IDs', () => {
      const ids = ['ABC', 'abc', 'AbC', 'aBc'];
      
      ids.forEach(driverId => {
        const params: RootStackParamList['DriverDetail'] = { driverId };
        
        expect(() => {
          validateNavigationParams('DriverDetail', params);
        }).not.toThrow();
        
        expect(validateNavigationParams('DriverDetail', params)).toBe(true);
      });
    });

    it('should validate single character driver IDs', () => {
      const singleCharIds = ['a', 'Z', '1', '@', '!'];
      
      singleCharIds.forEach(driverId => {
        const params: RootStackParamList['DriverDetail'] = { driverId };
        
        expect(() => {
          validateNavigationParams('DriverDetail', params);
        }).not.toThrow();
        
        expect(validateNavigationParams('DriverDetail', params)).toBe(true);
      });
    });

    it('should provide clear error messages for different validation failures', () => {
      // Test DriverList with invalid params
      expect(() => {
        validateNavigationParams('DriverList', { invalid: 'params' } as any);
      }).toThrow('Invalid parameters for DriverList screen');

      // Test DriverDetail with non-object
      expect(() => {
        validateNavigationParams('DriverDetail', 'not-an-object' as any);
      }).toThrow('Invalid parameters for DriverDetail screen');

      // Test DriverDetail with non-string driverId
      expect(() => {
        validateNavigationParams('DriverDetail', { driverId: 123 } as any);
      }).toThrow('Invalid driverId parameter');

      // Test DriverDetail with empty driverId
      expect(() => {
        validateNavigationParams('DriverDetail', { driverId: '' });
      }).toThrow('driverId cannot be empty');
    });
  });

  /**
   * Type guard tests
   */
  describe('Type Guard Behavior', () => {
    it('should return false instead of throwing for invalid parameters', () => {
      const invalidCases = [
        { screen: 'DriverList' as const, params: { invalid: 'params' } },
        { screen: 'DriverDetail' as const, params: { driverId: '' } },
        { screen: 'DriverDetail' as const, params: { driverId: 123 } },
        { screen: 'DriverDetail' as const, params: null },
        { screen: 'DriverDetail' as const, params: undefined },
      ];

      invalidCases.forEach(({ screen, params }) => {
        // Type guard should not throw
        expect(() => {
          isValidNavigationParams(screen, params);
        }).not.toThrow();
        
        // Should return false
        expect(isValidNavigationParams(screen, params)).toBe(false);
      });
    });

    it('should return true for valid parameters', () => {
      const validCases = [
        { screen: 'DriverList' as const, params: undefined },
        { screen: 'DriverDetail' as const, params: { driverId: 'valid-id' } },
        { screen: 'DriverDetail' as const, params: { driverId: '123' } },
        { screen: 'DriverDetail' as const, params: { driverId: 'uuid-format-id' } },
      ];

      validCases.forEach(({ screen, params }) => {
        expect(isValidNavigationParams(screen, params)).toBe(true);
      });
    });
  });
});
