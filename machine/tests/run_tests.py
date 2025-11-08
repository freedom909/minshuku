#!/usr/bin/env python3
"""
Test runner script for machine branch
"""
import sys
import os
import subprocess
import argparse
from pathlib import Path

# Add the machine directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))


def run_tests(test_pattern=None, verbose=False, coverage=False, skip_slow=False, skip_integration=False):
    """Run tests with specified parameters"""
    
    # Base pytest command
    cmd = ["python", "-m", "pytest"]
    
    # Add test directory
    cmd.append("tests/")
    
    # Add pattern if specified
    if test_pattern:
        cmd.append("-k")
        cmd.append(test_pattern)
    
    # Add verbose flag
    if verbose:
        cmd.append("-v")
    
    # Add coverage if requested
    if coverage:
        cmd.extend(["--cov=machine", "--cov-report=term", "--cov-report=html"])
    
    # Add skip flags
    if skip_slow:
        cmd.append("--skip-slow")
    if skip_integration:
        cmd.append("--skip-integration")
    
    # Add additional pytest options
    cmd.extend(["--tb=short", "--strict-markers"])
    
    print(f"Running command: {' '.join(cmd)}")
    print("=" * 80)
    
    # Run the tests
    result = subprocess.run(cmd, cwd=Path(__file__).parent.parent)
    
    return result.returncode


def run_specific_test_modules():
    """Run specific test modules"""
    
    test_modules = [
        "tests/test_core_modules.py",
        "tests/test_customer_service.py", 
        "tests/test_ml_services.py",
        "tests/test_analytics_services.py",
        "tests/test_api_routers.py"
    ]
    
    results = {}
    
    for module in test_modules:
        print(f"\n{'='*60}")
        print(f"Running tests in: {module}")
        print('='*60)
        
        cmd = ["python", "-m", "pytest", module, "-v", "--tb=short"]
        result = subprocess.run(cmd, cwd=Path(__file__).parent.parent)
        
        results[module] = result.returncode
        
        if result.returncode == 0:
            print(f"✅ {module} - PASSED")
        else:
            print(f"❌ {module} - FAILED")
    
    return results


def generate_test_report():
    """Generate a test report"""
    
    cmd = ["python", "-m", "pytest", "tests/", "--junitxml=test-results.xml", "-v"]
    
    print("Generating test report...")
    result = subprocess.run(cmd, cwd=Path(__file__).parent.parent)
    
    if result.returncode == 0:
        print("✅ Test report generated: test-results.xml")
    else:
        print("❌ Failed to generate test report")
    
    return result.returncode


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Run tests for machine branch")
    parser.add_argument("--pattern", "-k", help="Run tests matching pattern")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--coverage", "-c", action="store_true", help="Generate coverage report")
    parser.add_argument("--skip-slow", action="store_true", help="Skip slow tests")
    parser.add_argument("--skip-integration", action="store_true", help="Skip integration tests")
    parser.add_argument("--modules", action="store_true", help="Run specific test modules")
    parser.add_argument("--report", action="store_true", help="Generate test report")
    
    args = parser.parse_args()
    
    if args.modules:
        results = run_specific_test_modules()
        
        # Summary
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        
        passed = sum(1 for code in results.values() if code == 0)
        total = len(results)
        
        print(f"Modules passed: {passed}/{total}")
        
        if passed == total:
            print("🎉 All tests passed!")
            return 0
        else:
            print("❌ Some tests failed")
            return 1
    
    elif args.report:
        return generate_test_report()
    
    else:
        return run_tests(
            test_pattern=args.pattern,
            verbose=args.verbose,
            coverage=args.coverage,
            skip_slow=args.skip_slow,
            skip_integration=args.skip_integration
        )


if __name__ == "__main__":
    sys.exit(main())