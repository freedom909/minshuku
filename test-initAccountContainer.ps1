# PowerShell script to test initAccountContainer.js
Write-Host "Testing initAccountContainer..." -ForegroundColor Green

# Change to the project directory
Set-Location "c:\Users\omae9\OneDrive\Desktop\minshuku"

# Create a simple test script
$testScript = @'
import initAccountContainer from './services/DB/initAccountContainer.js';

async function testContainer() {
    try {
        console.log('Starting container initialization test...');
        
        const container = await initAccountContainer();
        console.log('✅ Container created successfully');
        
        // Test if services can be resolved
        const accountService = container.resolve('accountService');
        console.log('✅ AccountService resolved successfully');
        
        const userService = container.resolve('userService');
        console.log('✅ UserService resolved successfully');
        
        const cartService = container.resolve('cartService');
        console.log('✅ CartService resolved successfully');
        
        console.log('✅ All tests passed! Container is working correctly.');
        
    } catch (error) {
        console.error('❌ Container test failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

testContainer();
'@

# Write the test script to a file
$testScript | Out-File -FilePath "./test-container.js" -Encoding utf8

Write-Host "Running container test..." -ForegroundColor Yellow

# Run the test using Node.js
try {
    $result = node "./test-container.js" 2>&1
    Write-Host $result -ForegroundColor Cyan
} catch {
    Write-Host "Error running test: $_" -ForegroundColor Red
}

# Clean up the test file
Remove-Item "./test-container.js" -ErrorAction SilentlyContinue

Write-Host "Test completed." -ForegroundColor Green