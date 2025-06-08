// Container utility functions

// Function to register a service in the container
function registerService(container, serviceName, serviceFactory) {
  container.register({
    [serviceName]: asFunction(serviceFactory)
  });
  return container;
}

// Function to get a service from the container
function getService(container, serviceName) {
  return container.get(serviceName);
}

module.exports = {
  registerService,
  getService
};