<?php
$container = $app->getContainer();

// Inject a Monolog logger into the dependency container
$container['logger'] = function($c) {
    $logger = new Monolog\Logger('API');
    $fileHandler = new Monolog\Handler\StreamHandler('logs/api.log');

    $logger->pushHandler($fileHandler);

    return $logger;
};

// Replace notFoundHandler to use an API response
$container['notFoundHandler'] = function($c) {
    return function($request, $response) use ($c) {
        return $c['response']
            ->withHeader('Content-Type', 'application/json')
            ->write('{ message: "Matching API call not found." }');
    };
};

// Replace the errorHandler to use an API response
$container['errorHandler'] = function ($c) {
    return function ($request, $response, $exception) use ($c) {
        $c['logger']->addError('Server error', $exception->getTrace());

        return $c['response']->withStatus(500)
                             ->withHeader('Content-Type', 'application/json')
                             ->write('{ message: "Internal Server Error", error: "' .
                                $exception->getMessage() . '" }');
    };
};

$container['phpErrorHandler'] = function ($c) {
    return function ($request, $response, $exception) use ($c) {
        $c['logger']->addError('Server error', $exception->getTrace());

        return $c['response']->withStatus(500)
                             ->withHeader('Content-Type', 'application/json')
                             ->write('{ message: "Internal Server Error", error: "' .
                                $exception->getMessage() . '" }');
    };
};

// Routes ending in '/' use route without '/'
$app->add(function($request, $response, $next) {
    $uri = $request->getUri();
    $path = $uri->getPath();

    if (strlen($path) > 1 && substr($path, -1) === '/') {
        $path = substr($path, 0, -1);
    }

    if ($uri->getPath() !== $path) {
        return $next($request->withUri($uri->withPath($path)), $response);
    }

    return $next($request, $response);
});

