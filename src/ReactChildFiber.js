import { createFiber } from './reactFiber';
import { isArray, isStringOrNumber, Placement, Update } from './utils';

// 处理初次渲染 or 更新
// 初次渲染只记录下标
// 更新，检查节点是否发生移动
function placeChild(
  newFiber,
  lastPlacedIndex,
  newIndex,
  shouldTrackSideEffects
) {
  newFiber.index = newIndex;
  if (!shouldTrackSideEffects) {
    // 父节点初次渲染
    return lastPlacedIndex;
  }

  // 父节点更新
  // 判断子节点是初次渲染/更新
  const current = newFiber.alternate;
  if (current) {
    // 子节点更新
    const oldIndex = current.index;
    if (oldIndex < lastPlacedIndex) {
      // 发生节点移动，更新该节点
      newFiber.flags |= Placement;
      // lastPlacedIndex记录的是旧节点插入位置相对更新节点的最大下标，故返回该值
      return lastPlacedIndex;
    } else {
      return oldIndex;
    }
  } else {
    // 子节点初次渲染
    newFiber.flags |= Placement;
    return lastPlacedIndex;
  }
}

function mapRemainingChildren(currentFirstChild) {
  const existingChildren = new Map();
  let existingChild = currentFirstChild;
  while (existingChild) {
    existingChildren.set(
      existingChild.key || existingChild.index,
      existingChild
    );
    existingChild = existingChild.sibling;
  }
  return existingChildren;
}

// 协调（diff）
export function reconcileChildren(returnFiber, children) {
  if (isStringOrNumber(children)) return;

  const newChildren = isArray(children) ? children : [children];
  // oldFiber的头节点
  let oldFiber = returnFiber.alternate?.child;
  // 下一个oldFier，或者暂时缓存下一个oldFiber
  let nextOldFiber = null;
  // 用于判断returnFiber是初次渲染还是更新
  let shouldTrackSideEffects = !!returnFiber.alternate;
  let previousNewFiber = null;
  let newIndex = 0;
  // 上一次旧dom节点相对更新节点最远插入的最远位置，用于判断节点是否发生移动
  let lastPlacedIndex = 0;

  // 1. 从左往右遍历，比较新老节点，判定是否可复用，否则停止
  for (; oldFiber && newIndex < newChildren.length; newIndex++) {
    const newChild = newChildren[newIndex];
    if (newChild == null) {
      continue;
    }

    if (oldFiber.index > newIndex) {
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }

    const isSame = sameNode(newChild, oldFiber);
    if (!isSame) {
      if (oldFiber == null) {
        oldFiber = nextOldFiber;
      }
      break;
    }

    const newFiber = createFiber(newChild, returnFiber);
    Object.assign(newFiber, {
      stateNode: oldFiber.stateNode,
      alternate: oldFiber,
      flags: Update,
    });
    // 节点可复用，并更新
    lastPlacedIndex = placeChild(
      newFiber,
      lastPlacedIndex,
      newIndex,
      shouldTrackSideEffects
    );

    if (previousNewFiber == null) {
      returnFiber.child = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
    oldFiber = nextOldFiber;
  }

  // 2. 新节点遍历完，老节点还存在
  if (newIndex === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber);
    return;
  }

  // 3. 初次渲染 or 老节点没了，新节点还有
  if (!oldFiber) {
    for (; newIndex < newChildren.length; newIndex++) {
      const newChild = newChildren[newIndex];
      if (newChild == null) {
        continue;
      }

      const newFiber = createFiber(newChild, returnFiber);
      lastPlacedIndex = placeChild(
        newFiber,
        lastPlacedIndex,
        newIndex,
        shouldTrackSideEffects
      );

      if (previousNewFiber === null) {
        // head node
        returnFiber.child = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }

      previousNewFiber = newFiber;
    }
  }

  // 4. 新老节点都还存在
  // 将剩余的老节点存为哈希表
  const existingChildren = mapRemainingChildren(oldFiber);
  // 遍历剩余的新节点，在哈希表中查找可复用的老节点，并删除哈希表中该节点
  for (; newIndex < newChildren.length; newIndex++) {
    const newChild = newChildren[newIndex];
    if (newChild == null) {
      continue;
    }
    const newFiber = createFiber(newChild, returnFiber);
    const matchedFiber = existingChildren.get(newFiber.key || newFiber.index);
    if (matchedFiber) {
      // 复用并更新节点
      Object.assign(newFiber, {
        stateNode: matchedFiber.stateNode,
        alternate: matchedFiber,
        flags: Update,
      });
      existingChildren.delete(newFiber.key || newFiber.index);
    }
    lastPlacedIndex = placeChild(
      newFiber,
      lastPlacedIndex,
      newIndex,
      shouldTrackSideEffects
    );
    if (previousNewFiber == null) {
      returnFiber.child = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
  }

  // 5. 老节点的哈希表还有值，遍历删除
  if (shouldTrackSideEffects) {
    existingChildren.forEach(child => deleteChild(returnFiber, child));
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
