import { useNavigate } from 'react-router-dom'
import '../styles/PasswordConfirmation.css'
import backgroundImage from '../assets/images/Ash-Ai2.png'
import overlayImage from '../assets/images/Ash-Ai3.png'
import envelopeImage from '../assets/images/Ash-Ai4.png'

export default function PasswordConfirmation() {
  const navigate = useNavigate()

  const handleContinue = () => {
    navigate('/login')
  }

  return (
    <div className="password-confirmation-container">
      <div className="password-confirmation-content">
        {/* Left Section - Image */}
        <div className="password-confirmation-left" style={{ backgroundImage: `url(${backgroundImage})` }}>
          <img src={overlayImage} alt="Overlay" className="overlay-image" />
        </div>

        {/* Right Section - Confirmation */}
        <div className="password-confirmation-right">
          <div className="password-confirmation-form-container">
            {/* Envelope Icon */}
            <div className="envelope-icon-wrapper">
              <img src={envelopeImage} alt="Email Sent" className="envelope-icon" />
            </div>

            <h2 className="confirmation-title">E-mail successfully sent.</h2>
            <p className="confirmation-subtitle">
              A secure reset link has been delivered to your email address.
            </p>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="continue-button"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
