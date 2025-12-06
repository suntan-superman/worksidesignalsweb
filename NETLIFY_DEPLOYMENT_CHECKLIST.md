# Netlify Deployment - Post-Deploy Checklist

**Site URL:** https://worksidesignals.netlify.app ✅

---

## ✅ **Deployment Verified**

- [x] Site is live and accessible
- [x] HTTPS enabled automatically
- [x] Returns 200 OK status

---

## 🔧 **Critical: Environment Variables**

You MUST set these in Netlify dashboard for the app to work:

### **Go to:** https://app.netlify.com/sites/worksidesignals/settings/env

Set these variables:

```env
VITE_API_BASE_URL=https://workside-signals-api-b4elbrm5vq-uc.a.run.app

VITE_FIREBASE_API_KEY=AIzaSyDPMP_Yze0n1lrzLlXrDFFigbg5HNvULFY
VITE_FIREBASE_AUTH_DOMAIN=workside-signals.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=workside-signals
VITE_FIREBASE_STORAGE_BUCKET=workside-signals.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=106435684252
VITE_FIREBASE_APP_ID=1:106435684252:web:9bb355afda746cc9b0ca59
VITE_FIREBASE_MEASUREMENT_ID=G-G4T5JHK76H

VITE_SYNCFUSION_KEY=your-syncfusion-license-key
```

**After adding variables:**
1. Click "Save"
2. Trigger a new deploy: **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

---

## 🧪 **Testing Your Live App**

### **1. Basic Functionality**
- [ ] Visit https://worksidesignals.netlify.app
- [ ] Page loads without errors
- [ ] Login page appears (if not logged in)
- [ ] Create a test account or login
- [ ] Dashboard loads

### **2. Firebase Authentication**
- [ ] Login works
- [ ] Token is stored
- [ ] Protected routes redirect to login if not authenticated
- [ ] Logout works

### **3. API Connection**
- [ ] Dashboard shows data (or empty state)
- [ ] Alerts page loads
- [ ] Sensors page loads
- [ ] Check browser console for errors (F12)

### **4. Check for Errors**

Open browser console (F12) and look for:
- ❌ "Firebase config missing" → Environment variables not set
- ❌ "CORS error" → Backend needs CORS update
- ❌ "401 Unauthorized" → Authentication issue
- ✅ No errors → Everything working!

---

## 🔍 **Common Issues**

### **Issue 1: Blank page or "Firebase config missing"**
**Solution:**
1. Go to Netlify dashboard → Environment Variables
2. Add all `VITE_FIREBASE_*` variables
3. Redeploy the site

### **Issue 2: CORS errors when calling API**
**Solution:** Update backend CORS settings

```javascript
// backend/src/index.js
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://worksidesignals.netlify.app'  // ADD THIS
  ],
  credentials: true,
};
```

Then redeploy backend to Cloud Run.

### **Issue 3: "Syncfusion license key missing"**
**Solution:**
1. Get free trial from https://www.syncfusion.com/account/manage-subscriptions
2. Add `VITE_SYNCFUSION_KEY` to Netlify env vars
3. Redeploy

---

## 🚀 **Backend CORS Update (REQUIRED!)**

Your backend needs to allow requests from Netlify:

```bash
# 1. Update backend/src/index.js
# Add 'https://worksidesignals.netlify.app' to CORS origins

# 2. Redeploy backend
cd backend
gcloud run deploy workside-signals-api `
  --source . `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated
```

---

## 📊 **Netlify Dashboard Links**

- **Site Overview:** https://app.netlify.com/sites/worksidesignals
- **Deploys:** https://app.netlify.com/sites/worksidesignals/deploys
- **Environment Vars:** https://app.netlify.com/sites/worksidesignals/settings/env
- **Build Settings:** https://app.netlify.com/sites/worksidesignals/settings/deploys
- **Domain Settings:** https://app.netlify.com/sites/worksidesignals/settings/domain

---

## 🎨 **Optional: Custom Domain**

If you want to use a custom domain like `app.worksidellc.com`:

1. Go to **Domain settings** in Netlify
2. Click **Add custom domain**
3. Enter your domain
4. Update DNS records (Netlify provides instructions)
5. SSL certificate auto-generated

---

## 🔄 **Auto-Deploy from GitHub**

Netlify is now watching your GitHub repo!

**Every time you push to `main`:**
1. Netlify automatically builds your site
2. Runs `yarn build`
3. Deploys to `worksidesignals.netlify.app`

**No manual deploys needed!** 🎉

---

## 📈 **Next Steps**

1. ✅ **Set environment variables** in Netlify (critical!)
2. ✅ **Update backend CORS** to allow Netlify domain
3. ✅ **Test the live app** with a real user account
4. ✅ **Share the link** with your team for feedback
5. ⏳ **Deploy mobile app** to Expo EAS (next priority)

---

## 🎉 **Congratulations!**

You now have:
- ✅ Backend API on Google Cloud Run
- ✅ Web dashboard on Netlify
- ✅ Push notifications implemented
- ✅ Multi-tenant architecture
- ✅ Auto-deploy from GitHub

**Status:** 90% Complete to MVP! 🚀

Only mobile deployment remaining!

