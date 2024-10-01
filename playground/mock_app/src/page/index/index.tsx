import { useState } from "react";
import { useNavigate } from "react-router-dom";
import reactLogo from '../../assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css'

export default function Index() {
  const [count, setCount] = useState(0)
  const navigate = useNavigate();

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <button onClick={() => {
        const xhr = new XMLHttpRequest();
        xhr.open('get', '/api/log/list', true);
        xhr.send();
      }}>
        xhr
      </button>
      <button onClick={() => {
        fetch('/api/project/list')
      }}>
        fetch
      </button>
      <button onClick={() => {
        throw new Error('自定义错误')
      }}>
        error
      </button>
      <button  onClick={() => navigate("/login")}>去登录</button>
    </>
  )
}
