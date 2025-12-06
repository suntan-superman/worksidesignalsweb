# Web App Deployment Guide - Netlify

## 🚀 Deploy Workside Signals Web App to Netlify

**Estimated Time:** 15-20 minutes  
**Cost:** FREE (up to 100GB bandwidth/month)

---

## Prerequisites

1. **Netlify Account** - [Sign up free](https://app.netlify.com/signup)
2. **GitHub Repository** - Your code pushed to GitHub
3. **Backend Deployed** - API URL from Google Cloud Run

---

## Step 1: Prepare for Deployment

### Update API Client

Edit `web/src/services/api-client.js`:

```javascript
// Get API URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // ... rest of config
});
```

### Create Environment Variable File

Create `web/.env.production`:

```env
# Backend API URL (from Google Cloud Run)
VITE_API_URL=https://your-cloud-run-url

# Firebase Config (same as development)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Syncfusion License Key
VITE_SYNCFUSION_KEY=your-syncfusion-license-key
```

**Never commit `.env.production` to git!**

---

## Step 2: Create netlify.toml Configuration

Create `web/netlify.toml` in your web folder:

```toml
[build]
  # Build command
  command = "yarn build"
  
  # Output directory
  publish = "dist"
  
  # Node version
  environment = { NODE_VERSION = "20" }

# Redirect all routes to index.html for SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

# Cache static assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Environment-specific redirects (optional)
[context.production]
  environment = { NODE_ENV = "production" }

[context.deploy-preview]
  environment = { NODE_ENV = "staging" }
```

---

## Step 3: Deploy via Netlify Dashboard

### Method 1: Drag & Drop (Quick Test)

1. Build locally:
   ```bash
   cd web
   yarn build
   ```

2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag the `dist` folder
4. Get instant preview URL

### Method 2: GitHub Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click **"Add new site"** → **"Import an existing project"**
   - Choose **GitHub**
   - Select your repository
   - Select **main** branch

3. **Configure Build Settings:**
   - **Base directory:** `web`
   - **Build command:** `yarn build`
   - **Publish directory:** `web/dist`
   - Click **"Deploy site"**

---

## Step 4: Add Environment Variables in Netlify

1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"** → **"Import from .env file"**
3. Paste contents of your `.env.production`
4. Or add individually:

| Key | Value | Scopes |
|-----|-------|--------|
| `VITE_API_URL` | `https://your-cloud-run-url` | Production |
| `VITE_FIREBASE_API_KEY` | `your-key` | Production, Deploy Previews |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-domain` | Production, Deploy Previews |
| `VITE_FIREBASE_PROJECT_ID` | `your-id` | Production, Deploy Previews |
| `VITE_SYNCFUSION_KEY` | `your-key` | Production, Deploy Previews |

5. Click **"Save"**
6. **Trigger new deploy** to apply environment variables

---

## Step 5: Custom Domain Setup (Optional)

### Add Custom Domain:

1. Go to **Domain settings** → **Add custom domain**
2. Enter your domain: `workssidesignals.com`
3. Follow DNS instructions

### Option A: Netlify DNS (Easiest)

1. Click **"Use Netlify DNS"**
2. Update nameservers at your domain registrar:
   ```
   dns1.p0X.nsone.net
   dns2.p0X.nsone.net
   dns3.p0X.nsone.net
   dns4.p0X.nsone.net
   ```
3. Wait for DNS propagation (up to 24 hours)

### Option B: External DNS

Add these records to your DNS provider:

```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site.netlify.app
```

---

## Step 6: Enable HTTPS

1. Netlify automatically provisions SSL certificate
2. Wait 1-2 minutes after domain setup
3. **Force HTTPS:** Site settings → Domain management → HTTPS
4. Enable **"Force HTTPS"**

---

## Step 7: Configure Deploy Previews

### Enable Deploy Previews for PRs:

1. Go to **Site settings** → **Build & deploy** → **Deploy contexts**
2. Enable **"Deploy previews"**
3. Choose: **"Any pull request against your production branch"**

Now every PR gets a unique preview URL!

---

## Step 8: Setup Forms (Optional)

If you add contact forms:

```html
<!-- Add netlify attribute -->
<form name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact" />
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>
  <button type="submit">Send</button>
</form>
```

View submissions: **Forms** tab in Netlify dashboard

---

## Step 9: Performance Optimization

### Enable Asset Optimization:

1. Go to **Site settings** → **Build & deploy** → **Post processing**
2. Enable:
   - ✅ **Bundle CSS**
   - ✅ **Minify CSS**
   - ✅ **Minify JS**
   - ✅ **Pretty URLs** (optional)

### Add Prerendering (if needed):

```toml
# In netlify.toml
[build]
  command = "yarn build && yarn prerender"

[[plugins]]
  package = "@netlify/plugin-sitemap"
```

---

## Step 10: Setup Notifications

1. **Slack Integration:**
   - Site settings → Build & deploy → Deploy notifications
   - Add Slack webhook
   - Get notified on every deploy

2. **Email Notifications:**
   - Choose: Deploy succeeded, Deploy failed, etc.

---

## 🔄 Continuous Deployment

**Automatic deploys are enabled by default!**

Every push to `main` triggers:
1. Build on Netlify servers
2. Deploy to production
3. Notification sent
4. Old deploy kept as rollback option

### Branch Deploys:

```toml
# Deploy specific branches
[context.staging]
  command = "yarn build"
  environment = { NODE_ENV = "staging", VITE_API_URL = "https://staging-api-url" }
```

Push to `staging` branch → separate deploy URL

---

## 📊 Monitor Performance

### Netlify Analytics (Optional - $9/month):

1. Site settings → Analytics
2. Enable analytics
3. Get insights on:
   - Pageviews
   - Unique visitors
   - Top pages
   - Bandwidth usage

### Free Alternative - Google Analytics:

Add to `web/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🚨 Troubleshooting

### Build Fails with "Command not found":

**Solution:** Add to `netlify.toml`:
```toml
[build.environment]
  NODE_VERSION = "20"
  YARN_VERSION = "1.22.19"
```

### "Page Not Found" on Refresh:

**Solution:** Already handled by redirect rule in `netlify.toml`

### Environment Variables Not Working:

**Solution:**
1. Check variable names start with `VITE_`
2. Trigger new deploy after adding variables
3. Clear build cache: Site settings → Build & deploy → Clear cache

### Firebase Auth Not Working:

**Solution:** Add your Netlify domain to Firebase:
1. Firebase Console → Authentication → Settings
2. Add authorized domain: `your-site.netlify.app`

---

## 🔒 Security Best Practices

- [ ] Enable **HTTPS** (automatic with Netlify)
- [ ] Add **security headers** (in `netlify.toml`)
- [ ] Enable **Deploy Previews** for testing
- [ ] Use **environment variables** for secrets
- [ ] Add **Netlify Identity** for admin areas (optional)
- [ ] Enable **DDoS protection** (automatic)
- [ ] Review **access controls**

---

## 💰 Cost & Limits (Free Tier)

| Resource | Free Tier | Pro ($19/mo) |
|----------|-----------|--------------|
| Bandwidth | 100 GB/mo | 400 GB/mo |
| Build Minutes | 300 min/mo | 1000 min/mo |
| Sites | Unlimited | Unlimited |
| Team Members | 1 | Unlimited |
| Deploy Previews | ✅ | ✅ |
| Custom Domains | ✅ | ✅ |

**Typical usage for your app:** ~5-10 GB/month on free tier

---

## 📝 Post-Deployment Checklist

- [ ] Site URL: `https://your-site.netlify.app`
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled and forced
- [ ] Environment variables set correctly
- [ ] Backend API connection working
- [ ] Firebase auth working on production domain
- [ ] Syncfusion license applied
- [ ] Deploy notifications configured
- [ ] Build succeeds automatically on push

---

## 🎯 Next Steps

1. **Test Production:**
   ```bash
   # Visit your site
   https://your-site.netlify.app
   
   # Try login
   # Create test alert
   # View sensors
   ```

2. **Update Mobile Apps:**
   - Point mobile API client to production backend
   - Update Firebase config if needed

3. **Share with Team:**
   - Send production URL
   - Setup team access in Netlify

---

**Your web app is live! 🎉**

Next: Deploy mobile apps to TestFlight & Google Play

