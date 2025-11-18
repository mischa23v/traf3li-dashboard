import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Key, Smartphone, Lock, AlertCircle } from 'lucide-react'

function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الأمان - Security</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account security settings
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>
              Update your password regularly to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button>Update Password</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <CardTitle>Two-Factor Authentication</CardTitle>
            </div>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">SMS Authentication</p>
                <p className="text-sm text-muted-foreground">Receive codes via SMS</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Inactive</Badge>
                <Switch />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Authenticator App</p>
                <p className="text-sm text-muted-foreground">Use Google Authenticator or similar</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Inactive</Badge>
                <Switch />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Active Sessions</CardTitle>
            </div>
            <CardDescription>
              Manage devices where you're currently logged in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Current Device</p>
                <p className="text-sm text-muted-foreground">Chrome on Windows • Riyadh, Saudi Arabia</p>
                <p className="text-xs text-muted-foreground mt-1">Last active: Just now</p>
              </div>
              <Badge>Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </div>
            <CardDescription>
              Irreversible actions that affect your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" size="sm">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/settings/security')({
  component: SecurityPage,
})
