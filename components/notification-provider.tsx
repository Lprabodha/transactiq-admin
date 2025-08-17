"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Bell, X, AlertTriangle, Shield, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ApiService } from '@/lib/api-service'

export interface Notification {
  id: string
  type: 'fraud' | 'chargeback' | 'high-risk' | 'system' | 'success'
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
  const [isOpen, setIsOpen] = useState(false)

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    }
    
    setNotifications(prev => [newNotification, ...prev])
    
    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
      })
    }
    
    // Auto-remove low priority notifications after 30 seconds
    if (notification.priority === 'low') {
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, 30000)
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

    const checkForCriticalEvents = async () => {
      try {
        // Check for new high-risk transactions
        const transactionsResponse = await ApiService.getTransactions({ limit: 50 })
        if (transactionsResponse.success && transactionsResponse.data) {
          const highRiskTransactions = transactionsResponse.data.filter(
            (t: any) => (t.risk_score || 0) > 80 && !notifications.some(n => 
              n.type === 'high-risk' && n.data?.transaction_id === t.transaction_id
            )
          )

          highRiskTransactions.forEach((transaction: any) => {
            addNotification({
              type: 'high-risk',
              title: '🚨 High Risk Transaction Detected',
              message: `Transaction ${transaction.transaction_id} has ${transaction.risk_score}% risk score`,
              priority: 'critical',
              data: transaction
            })
          })

          // Check for new fraud detections
          const fraudTransactions = transactionsResponse.data.filter(
            (t: any) => t.fraud_detected && !notifications.some(n => 
              n.type === 'fraud' && n.data?.transaction_id === t.transaction_id
            )
          )

          fraudTransactions.forEach((transaction: any) => {
            addNotification({
              type: 'fraud',
              title: '⚠️ Fraud Detected',
              message: `Transaction ${transaction.transaction_id} flagged as fraudulent`,
              priority: 'high',
              data: transaction
            })
          })

          // Check for high chargeback risk
          const chargebackTransactions = transactionsResponse.data.filter(
            (t: any) => (t.chargeback_confidence || 0) > 75 && !notifications.some(n => 
              n.type === 'chargeback' && n.data?.transaction_id === t.transaction_id
            )
          )

          chargebackTransactions.forEach((transaction: any) => {
            addNotification({
              type: 'chargeback',
              title: '💳 High Chargeback Risk',
              message: `Transaction ${transaction.transaction_id} has ${transaction.chargeback_confidence}% chargeback risk`,
              priority: 'high',
              data: transaction
            })
          })
        }
      } catch (error) {
        console.error('Error checking for critical events:', error)
      }
    }

    // Check every 30 seconds for new critical events
    interval = setInterval(checkForCriticalEvents, 30000)
    
    // Initial check
    checkForCriticalEvents()

    return () => clearInterval(interval)
  }, [notifications])

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'fraud':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'chargeback':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'high-risk':
        return <Shield className="h-4 w-4 text-yellow-500" />
      case 'system':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-50'
      case 'high':
        return 'border-orange-500 bg-orange-50'
      case 'medium':
        return 'border-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-blue-500 bg-blue-50'
      default:
        return 'border-gray-500 bg-gray-50'
    }
  }

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
      
      {/* Notification Bell */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Notification Panel */}
        {isOpen && (
          <Card className="absolute right-0 top-12 w-96 max-h-96 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    Mark all read
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    disabled={notifications.length === 0}
                  >
                    Clear all
                  </Button>
                </div>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeNotification(notification.id)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {notification.timestamp.toLocaleTimeString()}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getPriorityColor(notification.priority)}`}
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </NotificationContext.Provider>
  )
}
