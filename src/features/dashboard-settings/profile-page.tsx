import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { User, Camera, Save } from 'lucide-react'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LanguageSwitcher } from '@/components/language-switcher'
import { DynamicIsland } from '@/components/dynamic-island'
import { useAuthStore } from '@/stores/auth-store'

const REGIONS = ['الرياض', 'مكة المكرمة', 'المدينة المنورة', 'القصيم', 'الشرقية', 'عسير', 'تبوك', 'حائل', 'الحدود الشمالية', 'جازان', 'نجران', 'الباحة', 'الجوف']
const NATIONALITIES = ['سعودي', 'إماراتي', 'كويتي', 'قطري', 'بحريني', 'عماني', 'يمني', 'عراقي', 'سوري', 'لبناني', 'أردني', 'فلسطيني', 'مصري', 'سوداني', 'ليبي', 'تونسي', 'جزائري', 'مغربي', 'هندي', 'باكستاني', 'بنغلاديشي', 'فلبيني', 'إندونيسي', 'بريطاني', 'فرنسي', 'ألماني', 'أمريكي', 'كندي']

const profileFormSchema = z.object({
  firstName: z.string().min(2, 'الاسم الأول مطلوب'),
  lastName: z.string().min(2, 'الاسم الأخير مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().max(500).optional(),
  licenseNumber: z.string().optional(),
  specialization: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfilePage() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const user = useAuthStore((state) => state.user)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      nationality: '',
      region: '',
      city: '',
      bio: '',
      licenseNumber: '',
      specialization: '',
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        nationality: '',
        region: '',
        city: '',
        bio: user.description || '',
        licenseNumber: '',
        specialization: '',
      })
    }
  }, [user, form])

  const topNav = [
    { title: isRTL ? 'الملف الشخصي' : 'Profile', href: '/dashboard/settings/profile', isActive: true },
    { title: isRTL ? 'الأمان' : 'Security', href: '/dashboard/settings/security', isActive: false },
    { title: isRTL ? 'التفضيلات' : 'Preferences', href: '/dashboard/settings/preferences', isActive: false },
  ]

  function onSubmit(data: ProfileFormValues) {
    console.log('Profile update:', data)
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center gap-4'>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main className="bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-navy">
              {isRTL ? 'الملف الشخصي' : 'Profile Settings'}
            </h1>
            <p className="text-slate-500 mt-1">
              {isRTL ? 'إدارة معلوماتك الشخصية' : 'Manage your personal information'}
            </p>
          </div>

          {/* Avatar Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.image} />
                    <AvatarFallback className="bg-navy text-white text-2xl">
                      {user?.firstName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-0 end-0 h-8 w-8 rounded-full bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-navy">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-slate-500">{user?.email}</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    {isRTL ? 'تغيير الصورة' : 'Change Photo'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'المعلومات الشخصية' : 'Personal Information'}</CardTitle>
              <CardDescription>
                {isRTL ? 'تحديث معلوماتك الشخصية' : 'Update your personal details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isRTL ? 'الاسم الأول' : 'First Name'}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isRTL ? 'الاسم الأخير' : 'Last Name'}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'البريد الإلكتروني' : 'Email'}</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" disabled className="bg-slate-100" />
                        </FormControl>
                        <FormDescription>
                          {isRTL ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'رقم الهاتف' : 'Phone Number'}</FormLabel>
                        <FormControl>
                          <Input {...field} dir="ltr" className="text-start" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isRTL ? 'الجنسية' : 'Nationality'}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={isRTL ? 'اختر الجنسية' : 'Select nationality'} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {NATIONALITIES.map((nat) => (
                                <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isRTL ? 'المنطقة' : 'Region'}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={isRTL ? 'اختر المنطقة' : 'Select region'} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {REGIONS.map((region) => (
                                <SelectItem key={region} value={region}>{region}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'المدينة' : 'City'}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isRTL ? 'رقم الرخصة' : 'License Number'}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isRTL ? 'التخصص' : 'Specialization'}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'نبذة عنك' : 'Bio'}</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} />
                        </FormControl>
                        <FormDescription>
                          {isRTL ? 'حد أقصى 500 حرف' : 'Maximum 500 characters'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                      <Save className="h-4 w-4 me-2" />
                      {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}

export default ProfilePage
