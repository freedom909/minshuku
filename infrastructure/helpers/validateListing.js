function validateInput(input) {
    const keys = new Set();
    for (const key in input) {
        if (keys.has(key)) {
            throw new Error(`Duplicate key found: ${key}`);
        }
        keys.add(key);
    }

    // Validate location fields  
    if (input.location) {
        const locationKeys = new Set();
        for (const key in input.location) {
            if (locationKeys.has(key)) {
                throw new Error(`Duplicate key found in location: ${key}`);
            }
            locationKeys.add(key);
        }
    }
}
export default validateInput;