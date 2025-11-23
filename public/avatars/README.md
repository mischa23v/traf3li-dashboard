# Avatars Directory

This directory is for user avatar images.

## Current Status

All avatar components have been updated to use **fallback avatars** (initials) instead of placeholder images.

## What Was Fixed

- Removed hardcoded references to `/avatars/01.png`, `/avatars/02.png`, etc.
- Components now gracefully fall back to showing user initials
- No more 404 errors in console for missing avatar images

## How It Works

The Avatar component automatically shows user initials when no image is available:

```tsx
<Avatar>
  <AvatarImage src={user?.avatar} alt={user?.name} />
  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
</Avatar>
```

If `user?.avatar` is undefined or the image fails to load, the fallback (initials) is shown.

## Adding Real Avatar Images

When you have real user data from your backend:

1. Users upload their avatars to your backend
2. Backend stores the image (e.g., on S3, Cloudinary, or local storage)
3. Backend returns the avatar URL in the user object: `{ avatar: "https://..." }`
4. Frontend displays the avatar using the URL from the backend

**No files need to be placed in this directory** - avatars come from your backend/storage.

## Examples

**With avatar URL from backend:**
```tsx
// User object from API
const user = {
  name: "John Doe",
  avatar: "https://api.traf3li.com/uploads/avatars/user123.jpg"
}

// Component automatically shows the image
<Avatar>
  <AvatarImage src={user.avatar} />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

**Without avatar (shows initials):**
```tsx
const user = {
  name: "John Doe",
  avatar: null // or undefined
}

// Shows "JD" initials
<Avatar>
  <AvatarImage src={user.avatar} />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```
