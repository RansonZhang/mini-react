import { createFiber } from './reactFiber';
import { isArray, isStringOrNumber, Update } from './utils';

// 协调（diff）
export function reconcileChildren(returnFiber, children) {
  if (isStringOrNumber(children)) return;

  const newChildren = isArray(children) ? children : [children];
  // oldFiber的头节点
  let oldFiber = returnFiber.alternate?.child;
  let previousNewFiber = null;
  let newIndex = 0;
  for (newIndex = 0; newIndex < newChildren.length; newIndex++) {
    const newChild = newChildren[newIndex];
    if (newChild == null) {
      continue;
    }

    const newFiber = createFiber(newChild, returnFiber);
    const isSame = sameNode(newFiber, oldFiber);
    if (isSame) {
      Object.assign(newFiber, {
        stateNode: oldFiber.stateNode,
        alternate: oldFiber,
        flags: Update,
      });
    }

    if (!isSame && oldFiber) {
      deleteChild(returnFiber, oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (previousNewFiber === null) {
      // head node
      returnFiber.child = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }

    previousNewFiber = newFiber;
  }

  // 老节点比新节点多，删除老节点
  if (newIndex === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber);
    return;
  }
}

/**
 * 节点复用条件
 * 1.同一层级
 * 2.类型相同
 * 3.key相同
 */
function sameNode(a, b) {
  return a && b && a.type === b.type && a.key === b.key;
}

function deleteChild(returnFiber, childToDelete) {
  const deletions = returnFiber.deletions;
  if (deletions) {
    returnFiber.deletions.push(childToDelete);
  } else {
    returnFiber.deletions = [childToDelete];
  }
}

function deleteRemainingChildren(returnFiber, currentFirstChild) {
  let childToDelete = currentFirstChild;
  while (childToDelete) {
    deleteChild(returnFiber, childToDelete);
    childToDelete = childToDelete.sibling;
  }
}
