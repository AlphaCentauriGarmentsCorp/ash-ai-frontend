import { useNavigate } from 'react-router-dom'
import '../styles/PasswordResetSuccess.css'
import backgroundImage from '../assets/images/Ash-Ai2.png'
import overlayImage from '../assets/images/Ash-Ai3.png'

export default function PasswordResetSuccess() {
  const navigate = useNavigate()

  const handleContinue = () => {
    navigate('/login')
  }

  return (
    <div className="password-reset-success-container">
      <div className="password-reset-success-content">
        {/* Left Section - Image */}
        <div className="password-reset-success-left" style={{ backgroundImage: `url(${backgroundImage})` }}>
          <img src={overlayImage} alt="Overlay" className="overlay-image" />
        </div>

        {/* Right Section - Success Message */}
        <div className="password-reset-success-right">
          <div className="password-reset-success-form-container">
            {/* Checkmark Icon */}
            <div className="checkmark-icon-wrapper">
              <svg className="checkmark-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#2ecc71" strokeWidth="3"/>
                <path d="M 30 50 L 45 65 L 70 35" fill="none" stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h2 className="reset-success-title">Password reset successful</h2>
            <p className="reset-success-subtitle">
              You can now log in with your new password.
            </p>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="reset-success-continue-button"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
