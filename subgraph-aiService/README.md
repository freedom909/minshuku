# Subgraph AI Service Documentation

## Dependencies

### Required Services
- `userService`: This service is essential for handling user authentication and authorization. Without it, the AI service cannot identify users and provide personalized experiences.

### Optional Services
- `listingService`: Used to fetch listings information. If unavailable, the AI service will skip any features related to listing recommendations.
- `bookingService`: Responsible for booking operations. If missing, the AI service will not support booking - related interactions.
- `paymentService`: Handles payment processing. When this service is unavailable, payment - related features will be disabled.

## Fallback Behavior for Missing Services
When an optional service is missing, the AI service will gracefully degrade. It will skip any features that rely on the unavailable service and continue to provide core functionality. For example, if `listingService` is not available, the AI will not generate listing - related responses but will still be able to handle user authentication and other basic tasks.

In case of a required service like `userService` being unavailable, the AI service will not function properly and will return an error message indicating that user authentication is required.