// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App';
import { ReactDOM, Component, useReducer, useState } from '../which-react';
import './index.css';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

function FunctionComponet(props) {
  const [count, setCount] = useReducer(x => x + 1, 0);
  const [count2, setCount2] = useState(4);
  return (
    <div className='fun'>
      <p>{props.name}</p>
      <button onClick={() => setCount()}>{count}</button>
      <button
        onClick={() => {
          count2 === 0 ? setCount2(4) : setCount2(count2 - 2);
        }}
      >
        {count2}
      </button>
      {count % 2 ? <div>111</div> : <div>222</div>}

      <ul>
        {[0, 1, 2, 3, 4].map(item => {
          return count2 >= item ? <li key={item}>{item}</li> : null;
        })}
      </ul>
    </div>
  );
}

class ClassComponent extends Component {
  render() {
    return (
      <div className='class'>
        <p>{this.props.name}</p>
        文本
      </div>
    );
  }
}

function FragmentComponent() {
  return (
    <ul>
      <>
        <li>1</li>
        <li>2</li>
      </>
    </ul>
  );
}

const jsx = (
  <div className='border'>
    <h1>react</h1>
    <a href='https://www.baidu.com'>baidu</a>
    <FunctionComponet name='函数组件' />
    <ClassComponent name='类组件' />
    <FragmentComponent />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(jsx);
