import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { createControllerBinder } from '../src/index.js'
import { ControllerBindingError, RouterBindingError } from '../src/errors.js'

const mockRouter = {
  urls: new Map(),
  get(x, m) {
    this.urls.set(x, m)
  },
  post() {},
  put() {},
  post() {},
  exec(method, url) {
    const h = this.urls.get(url)
    h()
  },
}

test('same router instance', () => {
  const router = createControllerBinder(mockRouter)
  assert.is(router.getRouter(), mockRouter)
})

test('fail registration with unnamed controller', () => {
  const router = createControllerBinder(mockRouter)
  assert.throws(
    () => router.register(class {}),
    function () {
      return new ControllerBindingError(
        "A name for the controller wasn't provided, please provide a named class instance or provide a name in the `options.name` for the `register` call",
        ControllerBindingError.NO_NAME
      )
    }
  )
})

test('register with named controller', () => {
  const router = createControllerBinder(mockRouter)
  router.register(class NamedController {})
  assert.ok(router.getController('NamedController'))
})

test('register already registered controller', () => {
  const router = createControllerBinder(mockRouter)

  router.register(class NamedController {})

  assert.throws(
    () => router.register(class NamedController {}),
    function () {
      return new ControllerBindingError(
        'NamedController is already bound to a controller',
        ControllerBindingError.NAME_ALREADY_BOUND
      )
    }
  )
})

test('invalid method binding', () => {
  const router = createControllerBinder(mockRouter)
  let methodName = 'GEX'
  router.register(class NamedController {})

  assert.throws(
    () => router.addRoute(methodName, '', ''),
    function () {
      return new RouterBindingError(
        `${methodName} method doesn't exist on router`,
        RouterBindingError.INVALID_METHOD
      )
    }
  )
})

test('invalid action name', () => {
  const router = createControllerBinder(mockRouter)
  router.register(class NamedController {})

  assert.throws(
    () => router.get('', 'NamedController.index'),
    function () {
      return new RouterBindingError(
        `Action with the name index was not found on the controller NamedController`,
        RouterBindingError.CONTROLLER_ACTION_NOT_FOUND
      )
    }
  )
})

test('Action name', () => {
  const router = createControllerBinder(mockRouter)

  router.register(
    class NamedController {
      index() {
        return 1
      }
    }
  )

  router.get('get', 'NamedController.index')

  const routes = router.listRoutes()
  const match = routes.find(x => x.url === 'get')

  assert.is(match.controllerName, 'NamedController')
})

test('Get route from controller', () => {
  const router = createControllerBinder(mockRouter)

  router.register(
    class NamedController {
      index(req) {
        return req.params.id
      }
    }
  )

  router.get('/get/:id', 'NamedController.index')
  const route = router.routeForAction('NamedController.index', { id: 1 })
  assert.is(route, '/get/1')
})

test('Get route from the alias of the controller', () => {
  const router = createControllerBinder(mockRouter)

  router.register(
    class NamedController {
      index(req) {
        return req.params.id
      }
    },
    {
      alias: 'named',
    }
  )

  router.get('/get/:id', 'NamedController.index')
  const route = router.routeForAction('named.index', { id: 1 })
  assert.is(route, '/get/1')
})

test('direct method exec', () => {
  const router = createControllerBinder(mockRouter)
  let executed = false
  router.get('/user', (req, res) => {
    executed = true
  })

  router.getRouter().exec('get', '/user')
  assert.is(executed, true)
})

test('middleware additions', () => {
  const router = createControllerBinder(mockRouter)

  let executionValue = 0
  let middlewareValue = 0

  router.register(
    class NamedController {
      index(req) {
        executionValue = 1
        return
      }
    },
    {
      alias: 'named',
    }
  )

  router.registerMiddleware('auth', (req, res, next) => {
    middlewareValue += 1
    next()
  })

  router.registerMiddleware('reqUtils', (req, res, next) => {
    middlewareValue += 1
    next()
  })

  router
    .get('/get/:id', 'NamedController.index')
    .middleware(['auth', 'reqUtils'])

  router.getRouter().exec('get', '/get/:id')

  assert.is(middlewareValue, 2)
  assert.is(executionValue, 1)
})

test.run()
