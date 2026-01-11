import passport from 'passport';
import { Strategy as Auth0Strategy } from 'passport-auth0';

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN!;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID!;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET!;
const AUTH0_CALLBACK_URL = process.env.AUTH0_CALLBACK_URL!;

passport.use(
  new Auth0Strategy(
    {
      domain: AUTH0_DOMAIN,
      clientID: AUTH0_CLIENT_ID,
      clientSecret: AUTH0_CLIENT_SECRET,
      callbackURL: AUTH0_CALLBACK_URL,
      state: true, // Enable state for CSRF protection (requires session)
    },
    (accessToken, _refreshToken, extraParams, profile, done) => {
      // Log everything we receive from Auth0
      console.log('=== Auth0 Strategy Callback ===');
      console.log('Access Token:', accessToken ? 'present' : 'missing');
      console.log('Extra Params:', JSON.stringify(extraParams, null, 2));
      console.log('Profile:', JSON.stringify(profile, null, 2));

      // Attach accessToken and extraParams to profile for use in callback
      (profile as any).extraParams = {
        ...extraParams,
        access_token: accessToken,
      };

      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});

export default passport;
