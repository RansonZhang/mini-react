import { createFiber } from './reactFiber';
import { isArray, isStringOrNumber, Update, updateNode } from './utils';
import { renderWithHooks } from './hooks';

// 原生标签
export function updateHostComponent(wip) {
  if (!wip.stateNode) {
    wip.stateNode = document.createElement(wip.type);
    updateNode(wip.stateNode, {}, wip.props);
  }

  reconcileChildren(wip, wip.props.children);
}

export function updateFunctionComponent(wip) {
  renderWithHooks(wip);
  const { type, props } = wip;
  const children = type(props);
  reconcileChildren(wip, children);
}

export function updateClassComponent(wip) {
  const { type, props } = wip;
  const instance = new type(props);
  const children = instance.render();
  reconcileChildren(wip, children);
}

export function updateFragmentComponent(wip) {
  reconcileChildren(wip, wip.props.children);
}

export function updateHostTextComponent(wip) {
  wip.stateNode = document.createTextNode(wip.props.children);
}

// 协调（diff）
function reconcileChildren(wip, children) {
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
