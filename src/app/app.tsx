// src/app/app.tsx
//import styles from './app.module.scss';
///import Login from '../components/pages/login/Login';
//import logo from '../assets/logo.png';
import { BrowserRouter, } from 'react-router-dom';
import { Router } from '../router/router';

function App() {
  return (
    <BrowserRouter>
        <Router />
    </BrowserRouter>
  );
}

export default App;