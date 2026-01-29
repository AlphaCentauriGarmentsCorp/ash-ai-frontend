import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/ForgotPassword.css'
import backgroundImage from '../assets/images/Ash-Ai2.png'
import overlayImage from '../assets/images/Ash-Ai3.png'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setEmail(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    console.log('Password reset request for:', email)
    // Handle password reset logic here
    setTimeout(() => {
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        {/* Left Section - Image */}
        <div className="forgot-password-left" style={{ backgroundImage: `url(${backgroundImage})` }}>
          <img src={overlayImage} alt="Overlay" className="overlay-image" />
        </div>

        {/* Right Section - Form */}
        <div className="forgot-password-right">
          <button className="back-button" onClick={() => navigate('/login')}>
            ←
          </button>

          <div className="forgot-password-form-container">
            <h2 className="forgot-password-title">Forgot your Password?</h2>
            <p className="forgot-password-subtitle">
              Enter your email and we'll send you a link where you can reset your password.
            </p>

            <form onSubmit={handleSubmit} className="forgot-password-form">
              {/* Email Field */}
              <div className="form-group">
                <div className="input-wrapper">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your e-mail"
                    value={email}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-button"
                disabled={loading || !email}
              >
                {loading ? 'Sending...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
