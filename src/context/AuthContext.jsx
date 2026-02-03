import { createContext, useContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [userType, setUserType] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const AVAILABLE_ROLES = [
    'admin',
    'general_manager',
    'csr',
    'graphic_artist',
    'finance',
    'purchasing',
    'cutter',
    'driver',
    'printer',
    'sewer',
    'qa',
    'packer',
    'warehouse_manager',
    'screen_maker',
    'sample_maker',
    'subcontract',
  ]

  useEffect(() => {
    const bypassAuth = import.meta.env.VITE_AUTH_BYPASS === 'true'
    if (bypassAuth) {
      const mockUser = {
        email: 'dev@local',
        user_type: 'admin',
        profile: { first_name: 'Dev', last_name: 'User' },
      }
      setUser(mockUser)
      setUserType(mockUser.user_type)
      setIsAuthenticated(true)
      return
    }

    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setUserType(parsedUser.user_type)
      setIsAuthenticated(true)
    }
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  const login = (userData, authToken) => {
    setUser(userData)
    setUserType(userData.user_type)
    setIsAuthenticated(true)
    localStorage.setItem('user', JSON.stringify(userData))
    if (authToken) {
      setToken(authToken)
      localStorage.setItem('token', authToken)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setUserType(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  // Development/Testing function to switch roles
  const switchRole = (newRole) => {
    if (AVAILABLE_ROLES.includes(newRole) && user) {
      const updatedUser = { ...user, user_type: newRole }
      setUser(updatedUser)
      setUserType(newRole)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, userType, isAuthenticated, login, logout, switchRole, AVAILABLE_ROLES }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
