# Quick Start Guide - FYURI

## 🚀 Running the Application

### Method 1: Visual Studio (Easiest)

1. Open `FYURI.slnx` in Visual Studio
2. Right-click the **Solution** in Solution Explorer
3. Select **"Configure Startup Projects..."**
4. Choose **"Multiple startup projects"**
5. Set both projects to **"Start"**:
   - ✅ FYURI.Server → Start
   - ✅ fyuri.client → Start
6. Click **OK**
7. Press **F5** to run

### Method 2: Command Line

**Terminal 1 - Backend:**
```powershell
cd FYURI.Server
dotnet run
```

**Terminal 2 - Frontend:**
```powershell
cd fyuri.client
npm run dev
```

## 🌐 Access URLs

- **Frontend (React App)**: https://localhost:5173
- **Backend API**: https://localhost:7282
- **API Docs**: https://localhost:7282/swagger (if enabled)

## ⚠️ First Time Setup

### 1. Trust Development Certificate

**If you see HTTPS warnings:**

Windows:
```powershell
dotnet dev-certs https --trust
```

Mac/Linux:
```bash
dotnet dev-certs https --trust
```

### 2. Install Frontend Dependencies

If you haven't already:
```powershell
cd fyuri.client
npm install
```

## 🔍 Troubleshooting

### Blank Page Issue
- Make sure **both** backend and frontend are running
- Access the **frontend** URL: https://localhost:5173
- Don't access the backend URL directly (7282)

### Port Already in Use
If ports 5173 or 7282 are busy:

**Backend**: Edit `FYURI.Server/Properties/launchSettings.json`
```json
"applicationUrl": "https://localhost:7282;http://localhost:5228"
```

**Frontend**: Edit `fyuri.client/vite.config.js`
```javascript
port: 5173
```

### CORS Errors
If you see CORS errors in browser console:
- Make sure backend is running on port 7282
- Check CORS configuration in `FYURI.Server/Program.cs`

### API Not Loading
Check that proxy is configured in `fyuri.client/vite.config.js`:
```javascript
proxy: {
	'^/api': {
		target: 'https://localhost:7282',
		secure: false
	}
}
```

## 📱 Testing the App

1. **Browse Products**: Click "קטלוג" in the navbar
2. **Add to Cart**: Click "הוסף לסל" on any product
3. **View Cart**: Click the cart icon in the navbar
4. **Checkout**: Click "המשך לתשלום" in the cart
5. **Complete Order**: Fill the form and submit

You should see:
- Order confirmation page
- Console logs in the backend terminal showing the email notification
- Order number generated

## 🔧 Development Tips

### Hot Reload
- **Frontend**: Changes auto-reload in browser
- **Backend**: Restart may be needed for C# changes (or use Hot Reload in VS)

### Console Logs
- **Frontend**: Browser DevTools Console (F12)
- **Backend**: Visual Studio Output window or terminal

### API Testing
Use the browser or tools like Postman:
- GET `https://localhost:7282/api/products`
- GET `https://localhost:7282/api/products/categories`

## 📝 Next Steps

After confirming the app works:
1. Add real product images to `/public` folder
2. Configure email service in `appsettings.json`
3. Update contact information
4. Add more products to the catalog
5. Set up a database for production

## ❓ Common Questions

**Q: Why two ports?**
A: Development setup runs frontend (React/Vite) and backend (ASP.NET) separately. The Vite dev server proxies API calls to the backend.

**Q: Will production use two servers?**
A: No. In production, you build the React app and serve it from the ASP.NET server on one port.

**Q: How do I build for production?**
A: 
```powershell
cd fyuri.client
npm run build
cd ../FYURI.Server
dotnet publish -c Release
```

**Q: Where do I add products?**
A: For now, edit `FYURI.Server/Controllers/ProductsController.cs` in the `_products` list. Later, add a database.
