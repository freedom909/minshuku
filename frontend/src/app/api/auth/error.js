// This file is needed for compatibility with NextAuth.js default error handling
// It exports a default function that handles authentication errors

export default function handler(req, res) {
  const { error } = req.query;
  
  // Log the error for debugging
  console.error('Authentication error:', error);
  
  // Return error response
  res.status(401).json({
    error: error || 'Authentication failed',
    message: getErrorMessage(error)
  });
}

// Helper function to get user-friendly error messages
function getErrorMessage(error) {
  switch (error) {
    case 'AccessDenied':
      return 'Access was denied. Please make sure you have the necessary permissions.';
    case 'Verification':
      return 'The verification process failed. Please try again.';
    case 'Configuration':
      return 'There was a problem with the authentication configuration.';
    case 'OAuthSignin':
      return 'Error occurred during OAuth sign in process.';
    case 'OAuthCallback':
      return 'Error occurred during OAuth callback processing.';
    case 'OAuthCreateAccount':
      return 'Could not create OAuth provider account.';
    case 'EmailCreateAccount':
      return 'Could not create email provider account.';
    case 'Callback':
      return 'Error occurred during the callback process.';
    case 'OAuthAccountNotLinked':
      return 'This email is already associated with another account.';
    case 'EmailSignin':
      return 'Error sending the verification email.';
    case 'CredentialsSignin':
      return 'Sign in failed. Check the provided credentials.';
    case 'SessionRequired':
      return 'Please sign in to access this page.';
    default:
      return 'An unexpected authentication error occurred.';
  }
}