import Login from './components/Login';
// если хотите использовать логотип, импортируйте картинку
import logo from './assets/logo.png';
function App() {
  return (
    <Login
      commentColor="#53D75B"   // ваш цвет комментария
      logo={<img src={logo} alt="Логотип" style={{ height: '60px' }} />}
    />
  );
}
export default App;
