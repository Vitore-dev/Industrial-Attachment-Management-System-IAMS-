import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const {
    isSubmitting,
    register,
    registerForm,
    roleOptions,
    updateRegisterForm,
  } = useAuth();

  return (
    <div className="page-stack">
      <div className="page-header">
        <h2>Register</h2>
      </div>

      <form className="auth-form" onSubmit={register}>
        <label>
          Username
          <input
            name="username"
            value={registerForm.username}
            onChange={updateRegisterForm}
            placeholder="Choose a username"
            required
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            value={registerForm.email}
            onChange={updateRegisterForm}
            placeholder="name@example.com"
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={registerForm.password}
            onChange={updateRegisterForm}
            placeholder="Create a password"
            required
          />
        </label>
        <label>
          Role
          <select name="role" value={registerForm.role} onChange={updateRegisterForm}>
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Phone number
          <input
            name="phone_number"
            value={registerForm.phone_number}
            onChange={updateRegisterForm}
            placeholder="Optional phone number"
          />
        </label>
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create account'}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
