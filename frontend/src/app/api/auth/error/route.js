import { NextResponse } from 'next/server';

// Handle authentication errors
export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const error = searchParams.get('error');
    
    // Log the error for debugging
    console.error('Authentication error:', error);
    
    // Return error response
    return NextResponse.json(
        { 
            error: error || 'Authentication failed',
            message: getErrorMessage(error)
        },
        { status: 401 }
    );
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