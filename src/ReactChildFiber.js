import { createFiber } from './reactFiber';
import { isArray, isStringOrNumber, Update } from './utils';

// 协调（diff）
export function reconcileChildren(wip, children) {
  if (isStringOrNumber(children)) return;

  const newChildren = isArray(children) ? children : [children];
  // oldFiber的头节点
  let oldFiber = wip.alternate?.child;
  let previousNewFiber = null;
  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i];
    if (newChild == null) {
      continue;
    }

    const newFiber = createFiber(newChild, wip);
    const isSame = sameNode(newFiber, oldFiber);
    if (isSame) {
      Object.assign(newFiber, {
        stateNode: oldFiber.stateNode,
        alternate: oldFiber,
        flags: Update,
      });
    }

    if (!isSame && oldFiber) {
      deleteChild(wip, oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (previousNewFiber === null) {
      // head node
      wip.child = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }

    previousNewFiber = newFiber;
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
