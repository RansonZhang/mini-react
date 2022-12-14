import {
  ClassComponent,
  Fragment,
  FunctionComponent,
  HostComponent,
  HostText,
} from './ReactWorkTags';
import {
  updateHostComponent,
  updateFunctionComponent,
  updateClassComponent,
  updateFragmentComponent,
  updateHostTextComponent,
} from './ReactFiberReconciler';
import { Placement, Update, updateNode } from './utils';
import { scheduleCallback } from './scheduler';

// work in progress 当前正在工作中的
let wip = null;
let wipRoot = null;

// 实现组件初次渲染和更新
export function scheduleUpdateOnFiber(fiber) {
  wip = fiber;
  wipRoot = fiber;
  scheduleCallback(workLoop);
}

function performUnitOfWork() {
  const { tag } = wip;
  // 1.更新当前组件
  switch (tag) {
    case HostComponent:
      updateHostComponent(wip);
      break;
    case FunctionComponent:
      updateFunctionComponent(wip);
      break;
    case ClassComponent:
      updateClassComponent(wip);
      break;
    case Fragment:
      updateFragmentComponent(wip);
      break;
    case HostText:
      updateHostTextComponent(wip);
      break;
    default:
      break;
  }

  // 2.更新下个节点
  if (wip.child) {
    wip = wip.child;
    return;
  }

  let next = wip;
  while (next) {
    if (next.sibling) {
      wip = next.sibling;
      return;
    }

    next = next.return;
  }

  wip = null;
}

function workLoop(IdleDedline) {
  while (wip) {
    performUnitOfWork();
  }

  if (!wip && wipRoot) {
    commitRoot();
  }
}

function commitRoot() {
  commitWorker(wipRoot);
  wipRoot = null;
}

function commitWorker(wip) {
  if (!wip) return;
  // 1.提交自己
  const parentNode = getParentNode(wip.return);
  const { flags, stateNode, tag } = wip;
  if (flags & Placement && stateNode) {
    const before = getHostSibling(wip.sibling);
    insertOrAppendPlacementNode(stateNode, before, parentNode);
  }
  if (flags & Update && stateNode) {
    updateNode(stateNode, wip.alternate.props, wip.props);
  }

  if (wip.deletions) {
    // 删除wip的子节点
    commitDeletions(wip.deletions, stateNode || parentNode);
  }

  if (tag === FunctionComponent) {
    invokeHooks(wip);
  }

  // 2.提交子节点
  commitWorker(wip.child);
  // 3.提交兄弟节点
  commitWorker(wip.sibling);
}

function getParentNode(wip) {
  let tem = wip;
  while (tem) {
    if (tem.stateNode) {
      return tem.stateNode;
    }
    tem = tem.return;
  }
}

function commitDeletions(deletions, parentNode) {
  for (let i = 0; i < deletions.length; i++) {
    parentNode.removeChild(getStateNode(deletions[i]));
  }
}

/**
 * 并非每个fiber都有dom节点
 */
function getStateNode(fiber) {
  let tem = fiber;
  while (!tem.stateNode) {
    tem = tem.child;
  }
  return tem.stateNode;
}

function getHostSibling(sibling) {
  while (sibling) {
    if (sibling.stateNode && !(sibling.flags & Placement)) {
      return sibling.stateNode;
    }
    sibling = sibling.sibling;
  }
  return null;
}

function insertOrAppendPlacementNode(stateNode, before, parentNode) {
  before
    ? parentNode.insertBefore(stateNode, before)
    : parentNode.appendChild(stateNode);
}

function invokeHooks(wip) {
  const { updateQueueOfLayout, updateQueueOfEffect } = wip;

  for (let i = 0; i < updateQueueOfLayout.length; i++) {
    const effect = updateQueueOfLayout[i];
    effect.create();
  }

  for (let i = 0; i < updateQueueOfEffect.length; i++) {
    const effect = updateQueueOfEffect[i];
    scheduleCallback(() => effect.create());
  }
}
