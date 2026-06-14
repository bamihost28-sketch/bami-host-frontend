# Page Loader Integration Guide

Your project now has a professional page loader that shows when navigating between pages!

## 🎯 Features

- ✅ **Automatic Route Detection** - Shows automatically when navigating to different pages
- ✅ **Smooth Animations** - Fade-in/fade-out with loading spinner
- ✅ **Dark Theme Support** - Matches your app's dark theme
- ✅ **Manual Control** - Manually show/hide loader when needed
- ✅ **Global Context** - Easy access from any component

---

## 🚀 How It Works

### Automatic (Default)
Pages automatically show a loader when navigating:

```
Landing → (click link) → Loader appears → About page loads
```

No additional code needed!

### Manual Control in Components

Use the `usePageLoader` hook to manually control the loader:

```typescript
import { usePageLoader } from '@/contexts/PageLoaderContext';

export function MyComponent() {
  const { showLoader, hideLoader, setLoading } = usePageLoader();

  const handleAsyncAction = async () => {
    showLoader(); // Show loader
    
    try {
      await someSlowOperation();
    } catch (error) {
      console.error(error);
    } finally {
      hideLoader(); // Hide loader
    }
  };

  return (
    <button onClick={handleAsyncAction}>
      Load Data
    </button>
  );
}
```

---

## 📝 API Reference

### `usePageLoader()`

Returns an object with:

| Method | Description | Example |
|--------|-------------|---------|
| `showLoader()` | Show the page loader | `showLoader()` |
| `hideLoader()` | Hide the page loader | `hideLoader()` |
| `setLoading(bool)` | Set loading state | `setLoading(true)` |
| `isLoading` | Current loading state | `if (isLoading) {...}` |

---

## 📂 Files Created

- `src/contexts/PageLoaderContext.tsx` - Context and hook
- `src/components/PageLoader.tsx` - Loader UI component
- `src/App.tsx` - Updated with loader integration

---

## 🎨 Customization

### Change Loader Appearance

Edit `src/components/PageLoader.tsx`:

```typescript
// Change colors
<Loader2 className="text-primary" /> // Change to your color

// Change size
<div className="w-16 h-16"> // Change width/height

// Change text
<p className="text-sm font-medium">Loading</p> // Customize text
```

### Change Animation Duration

Edit `src/contexts/PageLoaderContext.tsx`:

```typescript
// Adjust timeout duration (in ms)
const timer = setTimeout(() => {
  hideLoader();
}, 300); // Change 300 to desired milliseconds
```

### Auto-hide Delay

In `PageLoaderContext.tsx`, increase/decrease the timeout:
- **Fast**: 100-200ms
- **Standard**: 300-500ms (default: 300)
- **Slow**: 500-1000ms

---

## 💡 Best Practices

✅ **DO:**
- Use automatic loader for navigation
- Use manual control for API calls
- Always call `hideLoader()` in finally block

❌ **DON'T:**
- Show loader for < 200ms (too quick)
- Forget to hide loader (user stuck)
- Show multiple loaders at once

---

## 🔧 Common Use Cases

### Form Submission
```typescript
const handleSubmit = async (data) => {
  showLoader();
  try {
    await apiClient.post('/submit', data);
  } finally {
    hideLoader();
  }
};
```

### Data Fetch
```typescript
useEffect(() => {
  const fetchData = async () => {
    showLoader();
    try {
      const response = await apiClient.get('/data');
      setData(response.data);
    } finally {
      hideLoader();
    }
  };
  
  fetchData();
}, []);
```

### File Upload
```typescript
const handleFileUpload = async (file) => {
  showLoader();
  try {
    await uploadFile(file);
  } finally {
    hideLoader();
  }
};
```

---

## 🧪 Testing

The loader works automatically - just navigate between pages to see it in action!

To manually test:
1. Click a link to navigate
2. You should see the loader appear briefly
3. The loader clears after the page loads

---

## 📞 Troubleshooting

**Loader not showing?**
- Check if `PageLoaderProvider` is wrapping your app (it is! ✓)
- Verify you're using `usePageLoader` inside the provider

**Loader stuck?**
- Make sure you call `hideLoader()` or wrap async operation in try-finally
- Check browser console for errors

**Wrong styling?**
- Edit `src/components/PageLoader.tsx`
- Check Tailwind classes are applied

---

## 🎉 You're all set!

Your app now has professional page loading. Navigate between pages to see it in action!
