import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import {
  getStoredToken,
  saveToken,
  removeToken,
  setAuthToken,
  userAPI,
} from "../services/api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredToken())
  const [user, setUser] = useState(null)

  /* --------------------------------
     Sync token on app load
  -------------------------------- */
  useEffect(() => {
    const sync = async () => {
      if (token) {
        setAuthToken(token)
        try {
          const res = await userAPI.getMe()
          setUser(res.user)
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    }

    sync()
  }, [token])

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null)
      return null
    }

    const res = await userAPI.getMe()
    setUser(res.user)
    return res.user
  }, [token])

  /* --------------------------------
     Login
  -------------------------------- */
  const login = useCallback((newToken) => {
    saveToken(newToken)     // localStorage + memory
    setAuthToken(newToken)  // 🔥 sync fetch immediately
    setToken(newToken)      // 🔥 trigger re-render
  }, [])

  /* --------------------------------
     Logout
  -------------------------------- */
  const logout = useCallback(() => {
    removeToken()           // localStorage + memory
    setAuthToken(null)      // 🔥 clear API auth
    setToken(null)          // 🔥 trigger re-render
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ token, user, setUser, refreshUser, login, logout }),
    [token, user, refreshUser, login, logout]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
