"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ApiService } from '@/lib/api-service'
import { AlertTriangle, Shield, AlertCircle, CheckCircle, Info } from 'lucide-react'

export interface Notification {
  id: string
  type: 'fraud' | 'chargeback' | 'high-risk' | 'system' | 'success' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
  data?: any
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'fraud':
        return <AlertTriangle className="h-5 w-5" />
      case 'chargeback':
        return <AlertCircle className="h-5 w-5" />
      case 'high-risk':
        return <Shield className="h-5 w-5" />
      case 'success':
        return <CheckCircle className="h-5 w-5" />
      case 'info':
      case 'system':
        return <Info className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    }
    
    setNotifications(prev => [newNotification, ...prev])
    
    // Show toast notification using Sonner
    const toastOptions = {
      duration: notification.priority === 'critical' ? 10000 : 
                notification.priority === 'high' ? 6000 : 
                notification.priority === 'medium' ? 4000 : 3000,
      icon: getNotificationIcon(notification.type),
    }
    
    switch (notification.type) {
      case 'fraud':
      case 'high-risk':
        toast.error(notification.title, {
          description: notification.message,
          ...toastOptions,
        })
        break
      case 'chargeback':
        toast.warning(notification.title, {
          description: notification.message,
          ...toastOptions,
        })
        break
      case 'success':
        toast.success(notification.title, {
          description: notification.message,
          ...toastOptions,
        })
        break
      default:
        toast.info(notification.title, {
          description: notification.message,
          ...toastOptions,
        })
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter(n => !n.read).length

  // Monitor for critical events
  useEffect(() => {
    let interval: NodeJS.Timeout
    const checkedTransactions = new Set<string>()

    const checkForCriticalEvents = async () => {
      try {
        const transactionsResponse = await ApiService.getTransactions({ limit: 50 })
        if (transactionsResponse.success && transactionsResponse.data) {
          // Check for new high-risk transactions
          const highRiskTransactions = transactionsResponse.data.filter(
            (t: any) => (t.risk_score || 0) > 80 && !checkedTransactions.has(t.transaction_id)
          )

          highRiskTransactions.forEach((transaction: any) => {
            checkedTransactions.add(transaction.transaction_id)
            addNotification({
              type: 'high-risk',
              title: 'High Risk Transaction Detected',
              message: `Transaction ${transaction.transaction_id} has ${transaction.risk_score}% risk score`,
              priority: 'critical',
              data: transaction
            })
          })

          // Check for new fraud detections
          const fraudTransactions = transactionsResponse.data.filter(
            (t: any) => t.fraud_detected && !checkedTransactions.has(t.transaction_id)
          )

          fraudTransactions.forEach((transaction: any) => {
            checkedTransactions.add(transaction.transaction_id)
            addNotification({
              type: 'fraud',
              title: 'Fraud Detected',
              message: `Transaction ${transaction.transaction_id} flagged as fraudulent`,
              priority: 'high',
              data: transaction
            })
          })

          // Check for high chargeback risk
          const chargebackTransactions = transactionsResponse.data.filter(
            (t: any) => (t.chargeback_confidence || 0) > 0.75 && !checkedTransactions.has(t.transaction_id)
          )

          chargebackTransactions.forEach((transaction: any) => {
            checkedTransactions.add(transaction.transaction_id)
            addNotification({
              type: 'chargeback',
              title: 'High Chargeback Risk',
              message: `Transaction ${transaction.transaction_id} has ${(transaction.chargeback_confidence * 100).toFixed(0)}% chargeback risk`,
              priority: 'high',
              data: transaction
            })
          })
        }
      } catch (error) {
        console.error('Error checking for critical events:', error)
      }
    }

    // Check every 60 seconds for new critical events
    interval = setInterval(checkForCriticalEvents, 60000)
    
    // Initial check after 5 seconds
    const initialTimeout = setTimeout(checkForCriticalEvents, 5000)

    return () => {
      clearInterval(interval)
      clearTimeout(initialTimeout)
    }
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}
