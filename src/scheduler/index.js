import { peek, pop, push } from './minHeap';

let taskQueue = [];
let taskIdCounter = 1;

export function scheduleCallback(callback) {
  const current = getCurrentTime();
  const timeout = -1;
  const expirationTime = current + timeout;
  const newTask = {
    id: taskIdCounter++,
    callback,
    expirationTime,
    sortIndex: expirationTime,
  };

  push(taskQueue, newTask);
  requestHostCallback();
}

export function getCurrentTime() {
  return performance.now();
}

const channel = new MessageChannel();
const port2 = channel.port2;
channel.port1.onmessage = function () {
  workLoop();
};

function workLoop() {
  let currentTask = peek(taskQueue);
  while (currentTask) {
    const callback = currentTask.callback;
    currentTask.callback = null;
    callback();
    pop(taskQueue);
    currentTask = peek(taskQueue);
  }
}

function requestHostCallback() {
  port2.postMessage(null);
}
