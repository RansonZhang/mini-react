// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App';
import { ReactDOM, Component } from '../which-react';
import './index.css';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

function FunctionComponet(props) {
  return (
    <div className='fun'>
      <p>{props.name}</p>
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
