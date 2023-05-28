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

The following uses `express.Router` as an example but you can use any router that has the `get`, `post`, `put` methods with the signature of `(url:string,handler:func)`

```js
const _router = express.Router()
const router = createControllerBinder(_router)

class UserController {
  me(_,res) {
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
```

## LICENSE

[MIT](/LICENSE)
