/**
 * User Profile Component
 */

'use client';

import React, { useState, FormEvent, useCallback } from 'react';
import { cn } from '../utils/classNames';
import { Input } from './Input';
import { Button } from './Button';
import { Alert } from './Alert';
import { Card, CardHeader, CardBody, CardFooter } from './Card';

export interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  company?: string;
  jobTitle?: string;
  timezone?: string;
  language?: string;
}

export interface UserProfileProps {
  /** Current user data */
  user: UserProfileData;
  /** On save handler */
  onSave: (data: Partial<UserProfileData>) => Promise<void>;
  /** On change password click */
  onChangePassword?: () => void;
  /** On avatar change */
  onAvatarChange?: (file: File) => Promise<string>;
  /** Editable fields */
  editableFields?: (keyof UserProfileData)[];
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Success message */
  success?: string | null;
  /** Additional class name */
  className?: string;
  /** Show avatar section */
  showAvatar?: boolean;
  /** Labels customization */
  labels?: {
    title?: string;
    subtitle?: string;
    save?: string;
    cancel?: string;
    changePassword?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
    changeAvatar?: string;
  };
}

const defaultLabels = {
  title: 'Profile Information',
  subtitle: 'Update your personal information',
  save: 'Save changes',
  cancel: 'Cancel',
  changePassword: 'Change password',
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email address',
  phone: 'Phone number',
  company: 'Company',
  jobTitle: 'Job title',
  changeAvatar: 'Change avatar',
};

const defaultEditableFields: (keyof UserProfileData)[] = [
  'firstName',
  'lastName',
  'phone',
  'company',
  'jobTitle',
];

export function UserProfile({
  user,
  onSave,
  onChangePassword,
  onAvatarChange,
  editableFields = defaultEditableFields,
  loading = false,
  error,
  success,
  className,
  showAvatar = true,
  labels: customLabels,
}: UserProfileProps) {
  const labels = { ...defaultLabels, ...customLabels };

  const [formData, setFormData] = useState<Partial<UserProfileData>>({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || '',
    company: user.company || '',
    jobTitle: user.jobTitle || '',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const updateField = useCallback(<K extends keyof UserProfileData>(field: K, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      await onSave(formData);
      setHasChanges(false);
    },
    [formData, onSave]
  );

  const handleCancel = useCallback(() => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      company: user.company || '',
      jobTitle: user.jobTitle || '',
    });
    setHasChanges(false);
  }, [user]);

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onAvatarChange) return;

      setUploadingAvatar(true);
      try {
        await onAvatarChange(file);
      } finally {
        setUploadingAvatar(false);
      }
    },
    [onAvatarChange]
  );

  const isEditable = (field: keyof UserProfileData) => editableFields.includes(field);

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className={cn('space-y-6', className)}>
      {/* Alerts */}
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
            {labels.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--traf-text-secondary,#6b7280)]">
            {labels.subtitle}
          </p>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            {showAvatar && (
              <div className="flex items-center gap-6">
                <div className="relative">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[var(--traf-primary-100,#dbeafe)] dark:bg-[var(--traf-primary-900,#1e3a8a)]/30 flex items-center justify-center text-2xl font-semibold text-[var(--traf-primary-600,#2563eb)]">
                      {initials}
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                {onAvatarChange && (
                  <div>
                    <label className="cursor-pointer">
                      <span className="text-sm font-medium text-[var(--traf-primary-600,#2563eb)] hover:text-[var(--traf-primary-500,#3b82f6)]">
                        {labels.changeAvatar}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={uploadingAvatar}
                      />
                    </label>
                    <p className="text-xs text-[var(--traf-text-secondary,#6b7280)] mt-1">
                      JPG, PNG or GIF. Max 2MB.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={labels.firstName}
                value={formData.firstName || ''}
                onChange={(e) => updateField('firstName', e.target.value)}
                disabled={loading || !isEditable('firstName')}
                required
              />
              <Input
                label={labels.lastName}
                value={formData.lastName || ''}
                onChange={(e) => updateField('lastName', e.target.value)}
                disabled={loading || !isEditable('lastName')}
                required
              />
            </div>

            {/* Email (usually read-only) */}
            <Input
              label={labels.email}
              type="email"
              value={user.email}
              disabled={!isEditable('email')}
              helperText={!isEditable('email') ? 'Contact support to change your email' : undefined}
            />

            {/* Phone */}
            {(isEditable('phone') || user.phone) && (
              <Input
                label={labels.phone}
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
                disabled={loading || !isEditable('phone')}
                placeholder="+1 (555) 123-4567"
              />
            )}

            {/* Company & Job Title */}
            <div className="grid grid-cols-2 gap-4">
              {(isEditable('company') || user.company) && (
                <Input
                  label={labels.company}
                  value={formData.company || ''}
                  onChange={(e) => updateField('company', e.target.value)}
                  disabled={loading || !isEditable('company')}
                />
              )}
              {(isEditable('jobTitle') || user.jobTitle) && (
                <Input
                  label={labels.jobTitle}
                  value={formData.jobTitle || ''}
                  onChange={(e) => updateField('jobTitle', e.target.value)}
                  disabled={loading || !isEditable('jobTitle')}
                />
              )}
            </div>
          </form>
        </CardBody>

        <CardFooter>
          <div className="flex items-center justify-between">
            <div>
              {onChangePassword && (
                <Button variant="ghost" onClick={onChangePassword}>
                  {labels.changePassword}
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              {hasChanges && (
                <Button variant="outline" onClick={handleCancel} disabled={loading}>
                  {labels.cancel}
                </Button>
              )}
              <Button
                type="submit"
                loading={loading}
                disabled={!hasChanges}
                onClick={handleSubmit}
                loadingText="Saving..."
              >
                {labels.save}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default UserProfile;
