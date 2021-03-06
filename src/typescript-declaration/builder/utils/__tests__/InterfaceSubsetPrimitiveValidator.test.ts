import { InterfaceDeclaration } from '../../InterfaceDeclaration';
import { InterfaceSubsetPrimitiveValidator } from '../InterfaceSubsetPrimitiveValidator';
import { createNumber, createString } from '../../../dts/helpers/createDTSType';

describe('InterfaceSubsetPrimitiveValidator', () => {
  describe('String validator', () => {
    it('should return false for an empty interface', () => {
      expect(
        new InterfaceSubsetPrimitiveValidator().isInterfaceSubsetOfString(
          new InterfaceDeclaration(),
        ),
      ).toBe(false);
    });

    it('should return false for an interface containing some non-string attributes', () => {
      const stringInterface = new InterfaceDeclaration();
      stringInterface.addAttribute('hello', [createNumber()]);

      stringInterface.addAttribute('world', [createString()]);

      expect(
        new InterfaceSubsetPrimitiveValidator().isInterfaceSubsetOfString(stringInterface),
      ).toBe(false);
    });

    it('should return false for an interface containing both string and non-string attributes', () => {
      const stringInterface = new InterfaceDeclaration();
      stringInterface.addAttribute('length', [createNumber()]);

      stringInterface.addAttribute('hello', [createString()]);

      expect(
        new InterfaceSubsetPrimitiveValidator().isInterfaceSubsetOfString(stringInterface),
      ).toBe(false);
    });

    it('should return true for string attributes', () => {
      const stringInterface = new InterfaceDeclaration();
      stringInterface.addAttribute('length', [createNumber()]);

      expect(
        new InterfaceSubsetPrimitiveValidator().isInterfaceSubsetOfString(stringInterface),
      ).toBe(true);
    });

    it('should return true for index access', () => {
      const stringInterface = new InterfaceDeclaration();
      stringInterface.addAttribute('3', [createNumber()]);

      expect(
        new InterfaceSubsetPrimitiveValidator().isInterfaceSubsetOfString(stringInterface),
      ).toBe(true);
    });
  });
});
