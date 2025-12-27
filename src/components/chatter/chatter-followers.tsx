/**
 * Chatter Followers Component
 * Displays and manages followers list with notification preferences
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Users,
  UserPlus,
  UserMinus,
  Bell,
  BellOff,
  Mail,
  Smartphone,
  MessageSquare,
  Loader2,
  Settings,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import type { Follower } from '@/services/chatterService'
import type { ThreadResModel } from '@/types/message'

interface ChatterFollowersProps {
  resModel: ThreadResModel
  resId: string
  followers: Follower[]
  isFollowing: boolean
  isLoading?: boolean
  currentUserId?: string
  onToggleFollow: () => void
  onAddFollower?: (userId: string) => void
  onRemoveFollower?: (followerId: string) => void
  onUpdatePreferences?: (
    followerId: string,
    preferences: { email?: boolean; push?: boolean; sms?: boolean }
  ) => void
  className?: string
}

export function ChatterFollowers({
  resModel,
  resId,
  followers,
  isFollowing,
  isLoading = false,
  currentUserId,
  onToggleFollow,
  onAddFollower,
  onRemoveFollower,
  onUpdatePreferences,
  className,
}: ChatterFollowersProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [selectedFollower, setSelectedFollower] = React.useState<Follower | null>(null)

  if (isLoading) {
    return (
      <div className={cn('space-y-3 p-4', className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">
            {t('common.followers')}
          </h3>
          <Badge variant="secondary">{followers.length}</Badge>
        </div>

        {/* Quick Follow/Unfollow */}
        <Button
          variant={isFollowing ? 'outline' : 'default'}
          size="sm"
          onClick={onToggleFollow}
        >
          {isFollowing ? (
            <>
              <UserMinus className="h-4 w-4 me-2" />
              {t('common.unfollow')}
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 me-2" />
              {t('common.follow')}
            </>
          )}
        </Button>
      </div>

      {/* Followers List */}
      <ScrollArea className="h-[300px]">
        {followers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {t('common.noFollowersYet')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('common.addFollowersToKeepInformed')}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {followers.map((follower) => (
              <FollowerItem
                key={follower._id}
                follower={follower}
                isArabic={isArabic}
                isCurrentUser={follower.userId === currentUserId}
                onRemove={onRemoveFollower}
                onUpdatePreferences={onUpdatePreferences}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Add Follower */}
      {onAddFollower && (
        <div className="p-3 border-t">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <UserPlus className="h-4 w-4 me-2" />
                {t('common.addFollower')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t('common.addFollower')}
                </DialogTitle>
                <DialogDescription>
                  {t('common.searchForUserToAdd')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search-user">
                    {t('common.searchUser')}
                  </Label>
                  <Input
                    id="search-user"
                    placeholder={t('common.nameOrEmail')}
                  />
                </div>
                {/* User search results would go here */}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={() => setShowAddDialog(false)}>
                  {t('common.add')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}

// ==================== FOLLOWER ITEM ====================

interface FollowerItemProps {
  follower: Follower
  isArabic: boolean
  isCurrentUser: boolean
  onRemove?: (followerId: string) => void
  onUpdatePreferences?: (
    followerId: string,
    preferences: { email?: boolean; push?: boolean; sms?: boolean }
  ) => void
}

function FollowerItem({
  follower,
  isArabic,
  isCurrentUser,
  onRemove,
  onUpdatePreferences,
}: FollowerItemProps) {
  const { t: followerT } = useTranslation()
  const [showPreferences, setShowPreferences] = React.useState(false)
  const [emailNotif, setEmailNotif] = React.useState(
    follower.notificationPreferences?.email ?? true
  )
  const [pushNotif, setPushNotif] = React.useState(
    follower.notificationPreferences?.push ?? true
  )
  const [smsNotif, setSmsNotif] = React.useState(
    follower.notificationPreferences?.sms ?? false
  )

  const handleSavePreferences = () => {
    if (onUpdatePreferences) {
      onUpdatePreferences(follower._id, {
        email: emailNotif,
        push: pushNotif,
        sms: smsNotif,
      })
    }
    setShowPreferences(false)
  }

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={follower.user.avatar}
          alt={`${follower.user.firstName} ${follower.user.lastName}`}
        />
        <AvatarFallback>
          {follower.user.firstName[0]}
          {follower.user.lastName[0]}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">
            {follower.user.firstName} {follower.user.lastName}
          </p>
          {isCurrentUser && (
            <Badge variant="outline" className="text-xs">
              {followerT('common.you')}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{follower.user.email}</p>

        {/* Notification Preferences Indicators */}
        <div className="flex items-center gap-1 mt-1">
          {follower.notificationPreferences?.email && (
            <Mail className="h-3 w-3 text-muted-foreground" />
          )}
          {follower.notificationPreferences?.push && (
            <Bell className="h-3 w-3 text-muted-foreground" />
          )}
          {follower.notificationPreferences?.sms && (
            <Smartphone className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Notification Preferences */}
        {isCurrentUser && onUpdatePreferences && (
          <Popover open={showPreferences} onOpenChange={setShowPreferences}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-3">
                    {followerT('common.notificationPreferences')}
                  </h4>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-notif" className="text-sm cursor-pointer">
                        {followerT('common.email')}
                      </Label>
                    </div>
                    <Switch
                      id="email-notif"
                      checked={emailNotif}
                      onCheckedChange={setEmailNotif}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="push-notif" className="text-sm cursor-pointer">
                        {followerT('common.pushNotifications')}
                      </Label>
                    </div>
                    <Switch
                      id="push-notif"
                      checked={pushNotif}
                      onCheckedChange={setPushNotif}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="sms-notif" className="text-sm cursor-pointer">
                        {followerT('common.sms')}
                      </Label>
                    </div>
                    <Switch
                      id="sms-notif"
                      checked={smsNotif}
                      onCheckedChange={setSmsNotif}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreferences(false)}
                  >
                    {followerT('common.cancel')}
                  </Button>
                  <Button size="sm" onClick={handleSavePreferences}>
                    {followerT('common.save')}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Remove Follower */}
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(follower._id)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default ChatterFollowers
