import { FunctionDeclaration } from '../FunctionDeclaration';
import objectHash from 'object-hash';

export class FunctionDeclarationCleaner {
  functionDeclarations: FunctionDeclaration[] = [];

  clean(functionDeclarations: FunctionDeclaration[]): FunctionDeclaration[] {
    this.functionDeclarations = functionDeclarations;

    this.combineReturnValues();
    this.combineOptionalValue();
    this.combineArgumentTypesWithEqualReturnType();

    return this.functionDeclarations;
  }

  private combineArgumentTypesWithEqualReturnType() {
    const functionsByNameAndReturnType = new Map<string, FunctionDeclaration>();

    this.functionDeclarations.forEach((functionDeclaration) => {
      const key = this.getKeyWithReturnTypeOfs(functionDeclaration);

      const functionInMap = functionsByNameAndReturnType.get(key);
      if (!functionInMap) {
        functionsByNameAndReturnType.set(key, functionDeclaration);
        return;
      }

      functionInMap.getArguments().forEach((a) => {
        const equivalentArgument = functionDeclaration
          .getArguments()
          .filter((argument) => argument.index === a.index)[0];

        if (equivalentArgument) {
          equivalentArgument.getTypeOfs().forEach((t) => a.addTypeOf(t));
        }
      });
    });

    this.functionDeclarations = Array.from(functionsByNameAndReturnType.values());
  }

  private combineOptionalValue() {
    const functionsMapByName = new Map<string, FunctionDeclaration[]>();

    this.functionDeclarations.forEach((functionDeclaration) => {
      const functionsInMap = functionsMapByName.get(functionDeclaration.name) || [];
      functionsInMap.push(functionDeclaration);
      functionsMapByName.set(functionDeclaration.name, functionsInMap);
    });

    Array.from(functionsMapByName.keys()).forEach((functionName) => {
      functionsMapByName.get(functionName)?.forEach((functionDeclaration) => {
        functionDeclaration.getArguments().forEach((argumentDeclaration) => {
          if (argumentDeclaration.isOptional()) {
            functionsMapByName.get(functionName)?.forEach((f) => {
              f.getArguments()
                .filter((a) => a.index === argumentDeclaration.index)
                .forEach((a) => a.makeOptional());
            });
          }
        });
      });
    });
  }

  private combineReturnValues() {
    const uniqueDeclarationNameAndArguments: { [id: string]: FunctionDeclaration } = {};

    this.functionDeclarations.forEach((declaration) => {
      const serializedDeclaration =
        declaration.name +
        '__' +
        declaration
          .getArguments()
          .map((a) => a.serialize())
          .join(',');

      if (!(serializedDeclaration in uniqueDeclarationNameAndArguments)) {
        uniqueDeclarationNameAndArguments[serializedDeclaration] = declaration;
      } else {
        const d = uniqueDeclarationNameAndArguments[serializedDeclaration];
        declaration.getReturnTypeOfs().forEach((returnTypeOf) => {
          d.addReturnTypeOf(returnTypeOf);
        });
      }
    });

    const declarationWithCombinedReturnValues: FunctionDeclaration[] = [];

    for (const serializedDeclaration in uniqueDeclarationNameAndArguments) {
      if (uniqueDeclarationNameAndArguments.hasOwnProperty(serializedDeclaration)) {
        declarationWithCombinedReturnValues.push(
          uniqueDeclarationNameAndArguments[serializedDeclaration],
        );
      }
    }

    this.functionDeclarations = declarationWithCombinedReturnValues;
  }

  private getKeyWithReturnTypeOfs(functionDeclaration: FunctionDeclaration): string {
    const returnTypeOfsSerialized = objectHash(
      JSON.stringify(functionDeclaration.getReturnTypeOfs()),
    );

    return `${functionDeclaration.name}:${returnTypeOfsSerialized}`;
  }
}
