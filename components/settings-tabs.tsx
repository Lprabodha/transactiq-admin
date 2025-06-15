"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export function SettingsTabs() {
  const [webhookUrl, setWebhookUrl] = useState("https://api.yourcompany.com/webhooks/fraud-events")
  const [webhookSecret, setWebhookSecret] = useState("whsec_1234567890abcdefghijklmnopqrstuvwxyz")
  const [fraudThreshold, setFraudThreshold] = useState(70)
  const [chargebackThreshold, setChargebackThreshold] = useState(60)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [slackNotifications, setSlackNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)

  return (
    <Tabs defaultValue="webhooks" className="space-y-4">
      <TabsList>
        <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        <TabsTrigger value="ml-settings">ML Model Settings</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="api-keys">API Keys</TabsTrigger>
      </TabsList>

      <TabsContent value="webhooks" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Webhook Configuration</CardTitle>
            <CardDescription>
              Configure webhook endpoints to receive real-time fraud and chargeback events.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-server.com/webhook"
              />
              <p className="text-xs text-muted-foreground">The URL where we'll send webhook events.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-secret">Webhook Secret</Label>
              <div className="flex space-x-2">
                <Input
                  id="webhook-secret"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  type="password"
                />
                <Button variant="outline">Regenerate</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Used to verify webhook signatures. Keep this secret secure.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Event Types</Label>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fraud-detected" className="flex items-center gap-2">
                    <span>Fraud Detected</span>
                  </Label>
                  <Switch id="fraud-detected" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="chargeback-predicted" className="flex items-center gap-2">
                    <span>Chargeback Predicted</span>
                  </Label>
                  <Switch id="chargeback-predicted" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="model-updated" className="flex items-center gap-2">
                    <span>Model Updated</span>
                  </Label>
                  <Switch id="model-updated" defaultChecked />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Webhook Settings</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Webhook</CardTitle>
            <CardDescription>Send a test event to verify your webhook configuration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-type">Event Type</Label>
              <Select defaultValue="fraud_detected">
                <SelectTrigger id="event-type">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fraud_detected">Fraud Detected</SelectItem>
                  <SelectItem value="chargeback_predicted">Chargeback Predicted</SelectItem>
                  <SelectItem value="model_updated">Model Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Send Test Event</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="ml-settings" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Fraud Detection Model Settings</CardTitle>
            <CardDescription>Configure thresholds and parameters for the fraud detection model.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="fraud-threshold">Fraud Risk Threshold ({fraudThreshold}%)</Label>
              </div>
              <Slider
                id="fraud-threshold"
                min={0}
                max={100}
                step={1}
                value={[fraudThreshold]}
                onValueChange={(value) => setFraudThreshold(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Transactions with risk scores above this threshold will trigger fraud alerts.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="chargeback-threshold">Chargeback Probability Threshold ({chargebackThreshold}%)</Label>
              </div>
              <Slider
                id="chargeback-threshold"
                min={0}
                max={100}
                step={1}
                value={[chargebackThreshold]}
                onValueChange={(value) => setChargebackThreshold(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Transactions with chargeback probability above this threshold will trigger alerts.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model-version">Active Model Version</Label>
              <Select defaultValue="v2.1">
                <SelectTrigger id="model-version">
                  <SelectValue placeholder="Select model version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v2.1">v2.1 (Latest)</SelectItem>
                  <SelectItem value="v2.0">v2.0</SelectItem>
                  <SelectItem value="v1.2">v1.2</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The model version currently used for fraud detection and chargeback prediction.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-update" className="flex items-center gap-2">
                  <span>Automatic Model Updates</span>
                </Label>
                <Switch id="auto-update" defaultChecked />
              </div>
              <p className="text-xs text-muted-foreground">
                Automatically update to the latest model version when available.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Model Settings</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Configure how and when you receive notifications about fraud events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email Notifications</Label>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Receive fraud and chargeback alerts via email</p>
                  <p className="text-xs text-muted-foreground">Sent to admin@yourcompany.com</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Slack Notifications</Label>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Receive alerts in your Slack workspace</p>
                  <p className="text-xs text-muted-foreground">Sent to #fraud-alerts channel</p>
                </div>
                <Switch checked={slackNotifications} onCheckedChange={setSlackNotifications} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>SMS Notifications</Label>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Receive critical alerts via SMS</p>
                  <p className="text-xs text-muted-foreground">Sent to +1 (555) 123-4567</p>
                </div>
                <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-threshold">Notification Threshold</Label>
              <Select defaultValue="high">
                <SelectTrigger id="notification-threshold">
                  <SelectValue placeholder="Select threshold" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="medium">Medium Risk and Above</SelectItem>
                  <SelectItem value="high">High Risk Only</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only receive notifications for events above this risk threshold.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Notification Settings</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="api-keys" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage API keys for programmatic access to the fraud detection system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Live API Key</Label>
              <div className="flex space-x-2">
                <Input value="sk_live_1234567890abcdefghijklmnopqrstuvwxyz" type="password" readOnly />
                <Button variant="outline">Copy</Button>
              </div>
              <p className="text-xs text-muted-foreground">Use this key for production environments. Keep it secure.</p>
            </div>

            <div className="space-y-2">
              <Label>Test API Key</Label>
              <div className="flex space-x-2">
                <Input value="sk_test_1234567890abcdefghijklmnopqrstuvwxyz" type="password" readOnly />
                <Button variant="outline">Copy</Button>
              </div>
              <p className="text-xs text-muted-foreground">Use this key for testing and development environments.</p>
            </div>

            <div className="space-y-2">
              <Label>Webhook Signing Secret</Label>
              <div className="flex space-x-2">
                <Input value="whsec_1234567890abcdefghijklmnopqrstuvwxyz" type="password" readOnly />
                <Button variant="outline">Copy</Button>
              </div>
              <p className="text-xs text-muted-foreground">Used to verify webhook signatures.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Rotate Keys</Button>
            <Button>Create New API Key</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
