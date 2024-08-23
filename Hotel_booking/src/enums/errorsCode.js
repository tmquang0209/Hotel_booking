export const errorsCode = {
    BAD_REQUEST: 400, // This means that client-side input fails validation.
    UNAUTHORIZED: 401, // This means the user isn't not authorized to access a resource. It usually returns when the user isn't authenticated.
    FORBIDDEN: 403, // This means the user is authenticated, but it's not allowed to access a resource.
    NOT_FOUND: 404, // This indicates that the resource is not found.
    INTERNAL_SERVER_ERROR: 500, // This is a generic server error. It probably shouldn't be thrown explicitly.
    BAD_GATEWAY: 502, // This indicates an invalid response from an upstream server.
    SERVICE_UNAVAILABLE: 503, // This indicates that the server is not ready to handle the request.
};
