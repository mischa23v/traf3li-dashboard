import { useEffect, useMemo, useCallback, memo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthStore } from '@/stores/auth-store'
import { Skeleton } from '@/components/ui/skeleton'
import usersService from '@/services/usersService'

const REGIONS = ['الرياض', 'مكة المكرمة', 'المدينة المنورة', 'القصيم', 'الشرقية', 'عسير', 'تبوك', 'حائل', 'الحدود الشمالية', 'جازان', 'نجران', 'الباحة', 'الجوف']
const NATIONALITIES = ['سعودي', 'إماراتي', 'كويتي', 'قطري', 'بحريني', 'عماني', 'يمني', 'عراقي', 'سوري', 'لبناني', 'أردني', 'فلسطيني', 'مصري', 'سوداني', 'ليبي', 'تونسي', 'جزائري', 'مغربي', 'هندي', 'باكستاني', 'بنغلاديشي', 'فلبيني', 'إندونيسي', 'بريطاني', 'فرنسي', 'ألماني', 'أمريكي', 'كندي']

// Memoized loading skeleton to prevent unnecessary re-renders
const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className='space-y-8'>
      <Skeleton className='h-20 w-full' />
      <Skeleton className='h-20 w-full' />
      <Skeleton className='h-20 w-full' />
      <Skeleton className='h-10 w-32' />
    </div>
  )
})

export function ProfileForm() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const checkAuth = useAuthStore((state) => state.checkAuth)
  const isLoading = !user
  const [isSubmitting, setIsSubmitting] = useState(false)

  const profileFormSchema = useMemo(() => z.object({
    firstName: z
      .string()
      .min(1, t('settings.profile.validation.firstNameRequired'))
      .min(2, t('settings.profile.validation.firstNameMinLength'))
      .max(30, t('settings.profile.validation.firstNameMaxLength')),
    lastName: z
      .string()
      .min(1, t('settings.profile.validation.lastNameRequired'))
      .min(2, t('settings.profile.validation.lastNameMinLength'))
      .max(30, t('settings.profile.validation.lastNameMaxLength')),
    username: z
      .string()
      .min(1, t('settings.profile.validation.usernameRequired'))
      .min(3, t('settings.profile.validation.usernameMinLength'))
      .max(20, t('settings.profile.validation.usernameMaxLength')),
    email: z.string().email(t('settings.profile.validation.emailInvalid')),
    phone: z.string().optional(),
    nationality: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
    bio: z.string().max(500, t('settings.profile.validation.bioMaxLength')).optional(),
  }), [t])

  type ProfileFormValues = z.infer<typeof profileFormSchema>

  const defaultValues = useMemo(() => ({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    nationality: '',
    region: '',
    city: '',
    bio: '',
  }), [])

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema) as any,
    defaultValues,
  })

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        nationality: '',
        region: '',
        city: '',
        bio: user.description || '',
      })
    }
  }, [user, form])

  // Memoize submit handler to prevent recreation on every render
  const onSubmit = useCallback(async (data: ProfileFormValues) => {
    if (!user?._id) {
      toast.error('User not found. Please login again. | المستخدم غير موجود. يرجى تسجيل الدخول مرة أخرى.')
      return
    }

    setIsSubmitting(true)
    try {
      await usersService.updateUserProfile(user._id, {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        description: data.bio,
        // Note: nationality, region, city are not yet supported by the backend
        // [BACKEND-PENDING] Additional profile fields (nationality, region, city)
      })

      // Refresh user data in auth store
      await checkAuth()

      toast.success('Profile updated successfully | تم تحديث الملف الشخصي بنجاح')
    } catch (error: any) {
      // Error message is already bilingual from usersService
      toast.error(error.message || 'Failed to update profile. Please try again. | فشل في تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsSubmitting(false)
    }
  }, [user, checkAuth])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {/* Backend Pending Alert */}
        <Alert>
          <AlertDescription>
            <strong>{t('common.note') || 'Note'}:</strong> {t('settings.profile.backendPendingNote') || 'The nationality, region, and city fields are currently displayed but not saved. These features are pending backend implementation.'} | <strong>ملاحظة:</strong> حقول الجنسية والمنطقة والمدينة معروضة حالياً لكن لا يتم حفظها. هذه الميزات في انتظار التطبيق من جانب الخادم.
          </AlertDescription>
        </Alert>

        {/* First Name & Last Name */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='firstName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('settings.profile.firstName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('settings.profile.firstNamePlaceholder')} {...field} />
                </FormControl>
                <FormDescription>
                  {t('settings.profile.firstNameDescription')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='lastName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('settings.profile.lastName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('settings.profile.lastNamePlaceholder')} {...field} />
                </FormControl>
                <FormDescription>
                  {t('settings.profile.lastNameDescription')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Username */}
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.profile.username')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('settings.profile.usernamePlaceholder')}
                  {...field}
                  disabled
                  className='bg-muted'
                />
              </FormControl>
              <FormDescription>
                {t('settings.profile.usernameDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.profile.email')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('settings.profile.emailPlaceholder')}
                  {...field}
                  disabled
                  className='bg-muted'
                />
              </FormControl>
              <FormDescription>
                {t('settings.profile.emailDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.profile.phone')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('settings.profile.phonePlaceholder')}
                  {...field}
                  dir='ltr'
                  className='text-start'
                />
              </FormControl>
              <FormDescription>
                {t('settings.profile.phoneDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nationality & Region */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='nationality'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('settings.profile.nationality')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('settings.profile.nationalityPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {NATIONALITIES.map((nationality) => (
                      <SelectItem key={nationality} value={nationality}>
                        {nationality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t('settings.profile.nationalityDescription')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='region'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('settings.profile.region')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('settings.profile.regionPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t('settings.profile.regionDescription')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* City */}
        <FormField
          control={form.control}
          name='city'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.profile.city')}</FormLabel>
              <FormControl>
                <Input placeholder={t('settings.profile.cityPlaceholder')} {...field} />
              </FormControl>
              <FormDescription>
                {t('settings.profile.cityDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bio */}
        <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.profile.bio')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('settings.profile.bioPlaceholder')}
                  className='resize-none'
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t('settings.profile.bioDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Additional Settings */}
        <div className='bg-muted rounded-lg p-4'>
          <h3 className='text-sm font-medium mb-2'>{t('settings.profile.additionalSettings')}</h3>
          <p className='text-muted-foreground text-sm mb-3'>
            {t('settings.profile.additionalSettingsDescription')}
          </p>
          <ul className='text-muted-foreground text-sm space-y-1 list-disc list-inside'>
            <li>{t('settings.profile.accountSettingsHint')} <strong>{t('settings.tabs.account')}</strong></li>
            <li>{t('settings.profile.appearanceSettingsHint')} <strong>{t('settings.tabs.appearance')}</strong></li>
            <li>{t('settings.profile.displaySettingsHint')} <strong>{t('settings.tabs.display')}</strong></li>
            <li>{t('settings.profile.notificationsSettingsHint')} <strong>{t('settings.tabs.notifications')}</strong></li>
          </ul>
        </div>

        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className='me-2 h-4 w-4 animate-spin' />
              {t('settings.profile.updating') || 'Updating...'}
            </>
          ) : (
            t('settings.profile.updateProfile')
          )}
        </Button>
      </form>
    </Form>
  )
}
