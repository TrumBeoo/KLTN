const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userService = require('../services/userService');

passport.serializeUser((user, done) => {
  done(null, user.AccountID);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userService.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const googleId = profile.id;
        const avatarURL = profile.photos[0]?.value;

        console.log('Google OAuth - Processing user:', { email, name, googleId });

        let user = await userService.findOrCreateGoogleUser({
          googleId,
          email,
          name,
          avatarURL
        });

        console.log('Google OAuth - User processed:', { accountId: user.AccountID, role: user.Role });
        done(null, user);
      } catch (error) {
        console.error('Google OAuth Strategy Error:', error);
        done(error, null);
      }
    }
  )
);

module.exports = passport;
