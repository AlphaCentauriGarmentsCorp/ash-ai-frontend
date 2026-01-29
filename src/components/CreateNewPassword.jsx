import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/CreateNewPassword.css'
import backgroundImage from '../assets/images/Ash-Ai2.png'
import overlayImage from '../assets/images/Ash-Ai3.png'

export default function CreateNewPassword() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    console.log('Password reset:', formData.newPassword)
    // Handle password reset logic here
    navigate('/login')
  }

  return (
    <div className="create-password-container">
      <div className="create-password-content">
        {/* Left Section - Image */}
        <div className="create-password-left" style={{ backgroundImage: `url(${backgroundImage})` }}>
          <img src={overlayImage} alt="Overlay" className="overlay-image" />
        </div>

        {/* Right Section - Form */}
        <div className="create-password-right">
          <div className="create-password-form-container">
            <h2 className="create-password-title">Create your new password</h2>
            <p className="create-password-subtitle">
              Enter your new password below to complete the reset process.
            </p>

            <form onSubmit={handleSubmit} className="create-password-form">
              {/* New Password Field */}
              <div className="form-group">
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && <p className="error-message">{error}</p>}

              {/* Reset Password Button */}
              <button
                type="submit"
                className="reset-password-button"
              >
                Reset Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
