interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface GoogleAuthResponse {
  access_token: string;
  id_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

class GoogleAuthManager {
  private clientId = '44819422978-mvljcf530s56usua64u8evamq1beaohj.apps.googleusercontent.com';
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    return new Promise<void>((resolve, reject) => {
      // Check if already loaded
      if (window.google?.accounts) {
        this.isInitialized = true;
        resolve();
        return;
      }

      // Load Google Identity Services
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Wait for Google object to be available
        const checkGoogle = () => {
          if (window.google?.accounts) {
            this.isInitialized = true;
            resolve();
          } else {
            setTimeout(checkGoogle, 100);
          }
        };
        checkGoogle();
      };
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<GoogleUser> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.id) {
        reject(new Error('Google Identity Services not loaded'));
        return;
      }

      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response: any) => {
          try {
            const payload = this.parseJWT(response.credential);
            const user: GoogleUser = {
              id: payload.sub,
              email: payload.email,
              name: payload.name,
              picture: payload.picture
            };
            resolve(user);
          } catch (error) {
            reject(error);
          }
        }
      });

      window.google.accounts.id.prompt();
    });
  }

  async getAccessToken(scopes?: string): Promise<string> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        reject(new Error('Google OAuth2 not loaded'));
        return;
      }

      const defaultScopes = 'https://www.googleapis.com/auth/gmail.readonly email profile openid';
      
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: scopes || defaultScopes,
        callback: (response: GoogleAuthResponse) => {
          if (response.access_token) {
            console.log('✅ Access token received');
            resolve(response.access_token);
          } else {
            console.error('❌ No access token in response:', response);
            reject(new Error('Failed to get access token'));
          }
        },
        error_callback: (error: any) => {
          console.error('❌ OAuth error:', error);
          reject(new Error(`OAuth error: ${error.type || 'unknown'}`));
        }
      });

      try {
        client.requestAccessToken();
      } catch (error) {
        console.error('❌ Error requesting access token:', error);
        reject(error);
      }
    });
  }

  private parseJWT(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  async signOut() {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }
}

// Global type declarations
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

export const googleAuth = new GoogleAuthManager();
export type { GoogleUser, GoogleAuthResponse };