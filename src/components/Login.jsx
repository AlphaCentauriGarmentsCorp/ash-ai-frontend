import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Login.css'
import backgroundImage from '../assets/images/Ash-Ai2.png'
import overlayImage from '../assets/images/Ash-Ai3.png'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.sorbetesapparel.com/api/v2'
      const payload = {
        email: formData.email,
        password: formData.password,
        remember: formData.rememberMe,
      }

      console.log('[login] submit', { baseUrl, email: formData.email, remember: formData.rememberMe })

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      }

      const primaryUrl = `${baseUrl}/login/sorbetes`
      const origin = baseUrl.replace(/\/?api\/v2\/?$/, '').replace(/\/?api\/?$/, '')
      const fallbackUrl = `${origin}/api/login/sorbetes`

      console.log('[login] urls', { primaryUrl, fallbackUrl })

      let response = await fetch(primaryUrl, requestOptions)
      console.log('[login] primary response', { status: response.status, ok: response.ok })
      if (response.status === 404) {
        response = await fetch(fallbackUrl, requestOptions)
        console.log('[login] fallback response', { status: response.status, ok: response.ok })
      }

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const apiMessage =
          data?.errors?.email ||
          data?.errors?.password ||
          data?.message ||
          (response.status === 404
            ? `Login route not found. Tried: ${primaryUrl} then ${fallbackUrl}`
            : 'Login failed')
        setErrorMessage(apiMessage)
        return
      }

      const resourceUser = data?.user ?? null
      const token = data?.token

      const nameParts = (resourceUser?.name || '').trim().split(' ').filter(Boolean)
      const firstName = nameParts[0] || ''
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

      const userType = Array.isArray(resourceUser?.domain_role)
        ? (resourceUser.domain_role[0] || null)
        : null

      const userForApp = {
        ...resourceUser,
        user_type: userType || 'admin',
        profile: {
          first_name: firstName,
          last_name: lastName,
        },
      }

      login(userForApp, token)
      navigate('/dashboard')
    } catch (err) {
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-content">
        {/* Left Section - Image */}
        <div className="login-left" style={{ backgroundImage: `url(${backgroundImage})` }}>
          <img src={overlayImage} alt="Overlay" className="overlay-image" />
        </div>

        {/* Right Section - Login Form */}
        <div className="login-right">
          <div className="login-form-container">
            <h2 className="welcome-title">Welcome!</h2>
            <p className="welcome-subtitle">Log in to manage operations and unleash limitless style.</p>

            {errorMessage && (
              <div className="text-danger" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              {/* Email Field */}
              <div className="form-group">
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-footer">
                <label className="remember-checkbox">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <span>Remember my account</span>
                </label>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <button type="submit" className="login-button" disabled={isSubmitting}>
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
