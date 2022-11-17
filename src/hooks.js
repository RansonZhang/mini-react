import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop';

let currentlyRenderingFiber = null;
let workInProgressHook = null;

export function renderWithHooks(wip) {
  currentlyRenderingFiber = wip;
  // 因为函数组件刚开始，故应该没有首个hook，即没有hook单链表
  currentlyRenderingFiber.memorizedState = null;
  // 因为函数组件刚开始，故应该没有工作中的hook
  workInProgressHook = null;
}

function updateWorkInProgressHook() {
  let hook;
  const current = currentlyRenderingFiber.alternate;
  if (current) {
    // 组件更新
    currentlyRenderingFiber.memorizedState = current.memorizedState;
    if (workInProgressHook) {
      workInProgressHook = hook = workInProgressHook.next;
    } else {
      workInProgressHook = hook = currentlyRenderingFiber.memorizedState;
    }
  } else {
    // 初次渲染
    hook = {
      memorizedState: null,
      next: null,
    };
    if (workInProgressHook) {
      workInProgressHook = workInProgressHook.next = hook;
    } else {
      // 首个hook
      workInProgressHook = currentlyRenderingFiber.memorizedState = hook;
    }
  }

  return hook;
}

export function useReducer(reducer, initalState) {
  const hook = updateWorkInProgressHook();

  if (!currentlyRenderingFiber.alternate) {
    // 组件初次渲染，初始化值
    hook.memorizedState = initalState;
  }

  const dispatch = dispatchReducerAction.bind(
    null,
    currentlyRenderingFiber,
    hook,
    reducer
  );

  return [hook.memorizedState, dispatch];
}

function dispatchReducerAction(fiber, hook, reducer, action) {
  hook.memorizedState = reducer ? reducer(hook.memorizedState) : action;
  // 函数组件的老fiber即自身
  fiber.alternate = { ...fiber };
  // 不更新兄弟节点
  fiber.sibling = null;
  scheduleUpdateOnFiber(fiber);
}

export function useState(initalState) {
  return useReducer(null, initalState);
}
