# conrou

> **Con**troller bound **Rou**tes

Simple abstraction to bind controller classes to routes using action aliases.
Kinda like Laravel/Ruby on Rails

```js
router.post('/users', 'UserController.create')
// or
router.resource('/users', 'UserController')
```

## Installation

```sh
npm i @barelyhuman/conrou
```

## Usage

The following uses `express.Router` as an example but you can use any router
that has the `get`, `post`, `put` methods with the signature of
`(url:string,handler:func)`

```js
const _router = express.Router()
const router = createControllerBinder(_router)

class UserController {
  me(_, res) {
    return res.send('reaper')
  }
}

// Register the controller to the `router` container
// You are to register an uninstantiated class
router.register(UserController)

// or, you can create an alias
router.register(UserController, {
  alias: 'user',
})

router.get('/me', 'UserController.me')
// or, if you created an alias
router.get('/me', 'user.me')
// or
router.get('/me', (req, res) => {
  console.log('hello')
  res.end()
})

// to get the route for a particular controller, you can use the
// `routeForAction` method on the router.

router.routeForAction('UserController.me') //=> /me
router.routeForAction('user.me') //=> /me
```

## Middleware

Each router interface that you use might have a different way of handling middleware and so
it's not really recommended to use `conrou`'s middleware utility for this.

Though, conrou does provide a way for you to add in middleware that mimic the execution order similar to
express.

```js
// Using `polka` as an example
const app = polka()
// Register the router as before
const router = createControllerBinder(app)

router.register(AuthController)
router.registerMiddleware('auth', (req, res, next) => {
  req.currentUser = {
    id: 1,
  }
  next()
})

router
  .get('/user', (req, res) => {
    console.log(req.currentUser) // 1
    return res.end()
  })
  // tie the named middleware to this particular route
  // this syntax / API was inspired by AdonisJS (https://github.com/adonisjs/)
  .middleware(['auth'])
```

## LICENSE

[MIT](/LICENSE)
