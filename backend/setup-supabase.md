# Supabase Setup Guide

## 1. Get Your Supabase Keys

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/iaeiiaurhafdgprvqkti
2. Click on "Settings" in the left sidebar
3. Click on "API" in the settings menu
4. Copy the following values:

### Project URL
```
https://iaeiiaurhafdgprvqkti.supabase.co
```

### API Keys
- **anon/public key**: Copy this key
- **service_role key**: Copy this key (keep this secret!)

## 2. Update Environment Variables

Edit the `.env` file in the backend directory and replace:

```env
SUPABASE_URL=https://iaeiiaurhafdgprvqkti.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

## 3. Run the Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Run the schema you provided to create tables and RLS policies
3. Verify the tables are created in the Table Editor

## 4. Start the Backend

```bash
cd backend
node supabase-backend.js
```

## 5. Test the Connection

```bash
curl http://localhost:3001/api/health
```

You should see:
```json
{
  "status": "OK",
  "timestamp": "2024-...",
  "database": "Supabase PostgreSQL",
  "connection": "Connected"
}
```

## 6. Demo Data

The backend will automatically create demo data:
- **User**: Phone: +91 9876543210, PIN: 1234
- **Assets**: 4 sample assets
- **Nominees**: 2 sample nominees

## 7. Start Frontend

```bash
cd frontend
npm start
```

## 8. Login and Test

1. Go to http://localhost:3000
2. Login with:
   - Phone: +91 9876543210
   - OTP: 123456
   - PIN: 1234
3. Test CRUD operations on assets and nominees

## Troubleshooting

### Connection Issues
- Verify your Supabase URL and keys are correct
- Check that your Supabase project is active
- Ensure the database schema has been run

### RLS Policy Issues
- Make sure RLS is enabled on all tables
- Verify the policies are created correctly
- Check that the service role key has proper permissions

### Demo Data Issues
- Check the console logs for any errors
- Verify the user table has the demo user
- Check that foreign key relationships are correct
