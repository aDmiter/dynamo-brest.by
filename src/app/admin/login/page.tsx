import LoginForm from './LoginForm';
import { loginAction } from './actions';

export default function LoginPage() {
  return <LoginForm action={loginAction} />;
}
