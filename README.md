# MyBin.App

A waste management reporting application that simplifies bin inspection and contamination tracking.

## Deploying to Cloudflare Pages

Follow these steps to deploy MyBin.App to Cloudflare Pages:

### Prerequisites

1. A Cloudflare account
2. Git repository with your MyBin.App code

### Deployment Steps

1. **Log in to Cloudflare Dashboard**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Sign in to your account

2. **Create a New Pages Project**
   - Navigate to the "Pages" section
   - Click "Create a project"
   - Select "Connect to Git"

3. **Connect Your Repository**
   - Select the Git provider where your MyBin.App repository is hosted
   - Authenticate with your Git provider
   - Select the MyBin.App repository from the list

4. **Configure Build Settings**
   - Set the build configuration:
     ```
     Production branch: main (or your preferred branch)
     Build command: npm run build
     Build output directory: dist
     ```

5. **Environment Variables**
   - Add the necessary environment variables:
     ```
     VITE_SUPABASE_URL: your-supabase-url
     VITE_SUPABASE_ANON_KEY: your-supabase-anon-key
     ```

6. **Deploy**
   - Click "Save and Deploy"
   - Wait for the build and deployment process to complete

7. **Access Your Deployed Application**
   - Once deployment is successful, Cloudflare will provide a URL to access your application
   - The URL format will typically be: `https://your-project-name.pages.dev`

### Custom Domain (Optional)

1. Navigate to your Pages project settings
2. Go to "Custom domains"
3. Click "Set up a custom domain"
4. Follow the instructions to add and verify your domain

For more detailed information, refer to [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/).
