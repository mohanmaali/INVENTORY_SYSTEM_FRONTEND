import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Input, Form } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const { register } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(form);
      toast.success('Account created');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-2">Create your account</h2>
          <p className="text-sm text-gray-500 mb-6">Enter your details to create an account.</p>

          <Form onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <Input name="name" value={form.name} onChange={onChange} placeholder="John Doe" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <Input name="password" type="password" value={form.password} onChange={onChange} placeholder="Choose a strong password" />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="mt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </div>
          </Form>

          <div className="text-sm text-gray-500 mt-4">
            Already have an account? <Link to="/login" className="text-primary-600">Sign in</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Register;
