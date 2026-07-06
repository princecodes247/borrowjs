import { PluginObj, NodePath } from '@babel/core';
import * as t from '@babel/types';

export default function borrowJsPlugin(): PluginObj {
  return {
    name: 'borrowjs-compiler',
    visitor: {
      CallExpression(path) {
        if (
          t.isIdentifier(path.node.callee) && 
          (path.node.callee.name === 'borrow' || path.node.callee.name === 'borrowMut')
        ) {
          const targetArg = path.node.arguments[0];
          if (t.isIdentifier(targetArg)) {
            const ownerName = targetArg.name;
            const borrowType = path.node.callee.name;
            
            // Register the borrow on the Block scope
            const blockScope = path.scope.getFunctionParent() || path.scope.getBlockParent();
            
            if (!blockScope.getData('borrows')) {
              blockScope.setData('borrows', new Map());
            }
            
            const borrows = blockScope.getData('borrows');
            if (!borrows.has(ownerName)) {
               borrows.set(ownerName, []);
            }
            borrows.get(ownerName).push({ type: borrowType, path: path });
          }
        }
      },
      
      AssignmentExpression(path) {
        let left = path.node.left;
        
        // Handle `user.name = "John"`
        if (t.isMemberExpression(left) && t.isIdentifier(left.object)) {
          const ownerName = left.object.name;
          checkBorrowViolation(path, ownerName, "mutate property of");
        }
        
        // Handle `user = move(other)`
        if (t.isIdentifier(left)) {
          checkBorrowViolation(path, left.name, "reassign");
        }
      }
    }
  };
}

function checkBorrowViolation(path: NodePath, ownerName: string, actionMsg: string) {
  let currentScope: any = path.scope.getFunctionParent() || path.scope.getBlockParent();
  
  while (currentScope) {
    const borrows = currentScope.getData('borrows');
    if (borrows && borrows.has(ownerName)) {
      const activeBorrows = borrows.get(ownerName);
      
      if (activeBorrows.length > 0) {
        throw path.buildCodeFrameError(
          `BorrowError: Cannot ${actionMsg} '${ownerName}' because it is currently borrowed.`
        );
      }
    }
    currentScope = currentScope.parent;
  }
}
