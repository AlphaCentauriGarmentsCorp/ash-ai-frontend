import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Login.css'
import backgroundImage from '../assets/images/Ash-Ai2.png'
import overlayImage from '../assets/images/Ash-Ai3.png'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
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

  const handleSubmit = (e) => {
    e.preventDefault()
    // Mock user data - replace with actual API call
    const mockUser = {
      email: `${formData.username}@ashani.com`,
      user_type: 'admin', // Replace with actual role from backend
      profile: {
        first_name: formData.username,
        last_name: 'User'
      }
    }
    login(mockUser)
    navigate('/dashboard')
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

            <form onSubmit={handleSubmit} className="login-form">
              {/* Username Field */}
              <div className="form-group">
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    className="form-input"
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
              <button type="submit" className="login-button">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
