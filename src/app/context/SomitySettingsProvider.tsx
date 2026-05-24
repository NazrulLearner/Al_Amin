// src/app/context/SomitySettingsProvider.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useAuth } from '../providers/AuthProvider'
import { onSnapshot } from 'firebase/firestore'
import { collections } from '../../services/firebase/firebaseCollections'
import { DEFAULT_SOMITY_SETTINGS } from '../../types/settings'
import { formatDate } from '../../utils/formatters/dateFormatter'
import { formatAmount, type AmountFormatOptions } from '../../utils/formatters/amountFormatter'

// ============================================
// TYPES
// ============================================

interface SomitySettingsContextType {
  settings: any
  permissions: any
  loading: boolean
  refresh: () => Promise<void>
  hasPermission: (permission: string) => boolean
  getSetting: (path: string, defaultValue?: any) => any
  getDateFormat: () => string
  getCurrencySymbol: () => string
  getCurrencyCode: () => string
  getCurrencyPosition: () => 'before' | 'after'
  getDecimalPlaces: () => number
  getThousandSeparator: () => string
  getDecimalSeparator: () => string
  formatDate: (date: any) => string
  formatAmount: (amount: any) => string
}

// ============================================
// CONTEXT
// ============================================

const SomitySettingsContext = createContext<SomitySettingsContextType | null>(null)

export const useSomitySettings = () => {
  const context = useContext(SomitySettingsContext)
  if (!context) {
    throw new Error('useSomitySettings must be used within SomitySettingsProvider')
  }
  return context
}

// ============================================
// PROVIDER
// ============================================

interface SomitySettingsProviderProps {
  children: ReactNode
}

export const SomitySettingsProvider: React.FC<SomitySettingsProviderProps> = ({ children }) => {
  const { userData, currentMember } = useAuth()
  const [settings, setSettings] = useState<any>(DEFAULT_SOMITY_SETTINGS)
  const [permissions, setPermissions] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Real-time somity settings
    const settingsRef = collections.somitySettings()
    const unsubscribeSettings = onSnapshot(settingsRef, (doc) => {
      const data = doc.exists() ? doc.data() : {}
      setSettings({ ...DEFAULT_SOMITY_SETTINGS, ...data })
      setLoading(false)
    }, (error) => {
      console.error('Error listening to settings:', error)
      setLoading(false)
    })

    // User role permissions
    const userRole = userData?.role || 
                     currentMember?.membership?.role || 
                     'member'
    
    const roleRef = collections.role(userRole)
    const unsubscribeRole = onSnapshot(roleRef, (doc) => {
      if (doc.exists()) {
        setPermissions(doc.data().permissions || {})
      } else {
        setPermissions({
          viewMembers: false,
          viewFees: true,
          viewLoans: true,
          applyLoan: true,
          viewReports: true,
          viewNotices: true,
        })
      }
    }, (error) => {
      console.error('Error listening to permissions:', error)
    })

    return () => {
      unsubscribeSettings()
      unsubscribeRole()
    }
  }, [userData, currentMember])

  const refresh = async () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }

  const hasPermission = (permission: string): boolean => {
    return permissions[permission] === true
  }

  const getSetting = (path: string, defaultValue: any = null): any => {
    const keys = path.split('.')
    let value = settings
    for (const key of keys) {
      if (value === undefined || value === null) return defaultValue
      value = value[key]
    }
    return value !== undefined ? value : defaultValue
  }

  const getDateFormat = () => settings?.financial?.dateFormat || 'DD/MM/YYYY'
  const getCurrencySymbol = () => settings?.financial?.currencySymbol || '৳'
  const getCurrencyCode = () => settings?.financial?.currencyCode || 'BDT'
  const getCurrencyPosition = () => settings?.financial?.currencyPosition || 'after'
  const getDecimalPlaces = () => settings?.financial?.decimalPlaces || 2
  const getThousandSeparator = () => settings?.financial?.thousandSeparator || ','
  const getDecimalSeparator = () => settings?.financial?.decimalSeparator || '.'

  const formatDateHelper = (date: any) => formatDate(date, getDateFormat())

  const formatAmountHelper = (amount: any) => {
    const options: AmountFormatOptions = {
      currencySymbol: getCurrencySymbol(),
      decimalPlaces: getDecimalPlaces(),
      thousandSeparator: getThousandSeparator(),
      position: getCurrencyPosition()
    }
    return formatAmount(amount, options)
  }

  const value: SomitySettingsContextType = {
    settings,
    permissions,
    loading,
    refresh,
    hasPermission,
    getSetting,
    getDateFormat,
    getCurrencySymbol,
    getCurrencyCode,
    getCurrencyPosition,
    getDecimalPlaces,
    getThousandSeparator,
    getDecimalSeparator,
    formatDate: formatDateHelper,
    formatAmount: formatAmountHelper
  }

  return (
    <SomitySettingsContext.Provider value={value}>
      {children}
    </SomitySettingsContext.Provider>
  )
}