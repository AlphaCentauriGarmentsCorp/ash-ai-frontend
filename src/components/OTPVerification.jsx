import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/OTPVerification.css'
import backgroundImage from '../assets/images/Ash-Ai2.png'
import overlayImage from '../assets/images/Ash-Ai3.png'

export default function OTPVerification() {
  const navigate = useNavigate()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef([])

  const handleChange = (e, index) => {
    const value = e.target.value
    
    if (value.length > 1) return
    
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const otpCode = otp.join('')
    if (otpCode.length === 6) {
      console.log('OTP submitted:', otpCode)
      // Handle OTP verification logic here
    }
  }

  const handleResend = () => {
    setOtp(['', '', '', '', '', ''])
    inputRefs.current[0]?.focus()
    console.log('Resending OTP...')
  }

  return (
    <div className="otp-container">
      <div className="otp-content">
        {/* Left Section - Image */}
        <div className="otp-left" style={{ backgroundImage: `url(${backgroundImage})` }}>
          <img src={overlayImage} alt="Overlay" className="overlay-image" />
        </div>

        {/* Right Section - OTP Form */}
        <div className="otp-right">
          <button className="back-button" onClick={() => navigate('/login')}>
            ←
          </button>

          <div className="otp-form-container">
            <h2 className="otp-title">OTP Verification</h2>
            <p className="otp-subtitle">
              Please enter the OTP (One-time password) sent to your registered email to complete your verification.
            </p>

            <form onSubmit={handleSubmit} className="otp-form">
              {/* OTP Input Fields */}
              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="otp-input"
                    placeholder="•"
                    inputMode="numeric"
                  />
                ))}
              </div>

              {/* Resend Link */}
              <div className="resend-section">
                <span className="resend-text">Didn't got the code? </span>
                <button
                  type="button"
                  className="resend-button"
                  onClick={handleResend}
                >
                  Resend
                </button>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                className="verify-button"
                disabled={otp.join('').length !== 6}
              >
                Verify
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
