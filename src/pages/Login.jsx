import { useContext } from 'react';
import { LoginContext } from '../context/LoginProvider';
import capa from '../images/yumYard.png';
import '../style/Login.css';

function Login() {
  const { emailInput, password, setEmail, setPassword,
    disabled, submitButton } = useContext(LoginContext);

  return (
    <div className="login-container">
      <img src={ capa } alt="Logo escrito Yum Yard" className="login-logo" />
      <section className="login-form">
        <input
          type="email"
          name="email"
          value={ emailInput }
          id="email"
          placeholder="E-mail"
          data-testid="email-input"
          onChange={ ({ target }) => setEmail(target.value) }
          className="login-input"
        />
        <input
          type="password"
          name="password"
          value={ password }
          id="password"
          placeholder="Senha"
          data-testid="password-input"
          onChange={ ({ target }) => setPassword(target.value) }
          className="login-input"
        />
        <button
          type="button"
          disabled={ disabled }
          data-testid="login-submit-btn"
          id="buttonLogin"
          onClick={ submitButton }
          className="login-button"
        >
          Entrar
        </button>
      </section>
    </div>
  );
}

export default Login;
