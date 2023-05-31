import { ControllerBindingError, RouterBindingError } from './errors.js'
import { compile } from 'path-to-regexp'

/**
 * @param {import("./types/types").RouterInterface} router
 */
export function createControllerBinder(router) {
  const controllerBindings = new Map()
  const routeBinding = new Map()

  return {
    getRouter() {
      return router
    },

    /**
     * Expects a class with a set of static functions
     * that can be called as the handlers
     * @param {new (...args: any[]) => any} controller
     * */
    register(controller, { name = '', alias = '' } = {}) {
      const _name = name || controller.name

      if (!_name)
        throw new ControllerBindingError(
          "A name for the controller wasn't provided, please provide a named class instance or provide a name in the `options.name` for the `register` call",
          ControllerBindingError.NO_NAME
        )

      if (controllerBindings.has(_name)) {
        throw new ControllerBindingError(
          `${_name} is already bound to a controller`,
          ControllerBindingError.NAME_ALREADY_BOUND
        )
      }

      const controllerInst = new controller()

      if (alias) {
        controllerBindings.set(alias, {
          alias: _name,
          name: alias,
          controller: controllerInst,
        })
      }
      controllerBindings.set(_name, {
        alias: _name,
        name: _name,
        controller: controllerInst,
      })
    },

    /**
     * @param {string} method
     * @param {string} url
     * @param {string} action
     */
    addRoute(method, url, action) {
      if (!router[method]) {
        throw new RouterBindingError(
          `${method} method doesn't exist on router`,
          RouterBindingError.INVALID_METHOD
        )
      }

      const [controllerName, actionName] = action.split('.')
      const binding = controllerBindings.get(controllerName)
      if (!binding) {
        throw new RouterBindingError(
          `Controller with the name ${controllerName} was not found.
       Available Names: ${[...controllerBindings.entries()]
         .map(x => x[0])
         .join(',')}
       `,
          RouterBindingError.CONTROLLER_NOT_FOUND
        )
      }

      const controller = binding.controller

      if (!controller[actionName]) {
        throw new RouterBindingError(
          `Action with the name ${actionName} was not found on the controller ${controllerName}`,
          RouterBindingError.CONTROLLER_ACTION_NOT_FOUND
        )
      }

      router[method](url, controller[actionName])

      routeBinding.set(url, {
        method,
        url,
        action,
        controllerName,
        actionName,
      })
    },

    /**
     * @param {string} name
     */
    getController(name) {
      const binding = controllerBindings.get(name)
      return binding.controller || undefined
    },

    /**
     * @param {string} base
     */
    resource(base, controllerName) {
      let normalizedBase = base
      const binding = controllerBindings.get(controllerName)

      if (!binding) {
        throw new ControllerBindingError(
          'Cannot find the controller with the name ${controllerName}',
          ControllerBindingError.NOT_FOUND
        )
      }

      if (!normalizedBase.startsWith('/')) {
        normalizedBase = '/' + base
      }

      if (normalizedBase.endsWith('/')) {
        normalizedBase = base.slice(0, -1)
      }

      const controller = binding.controller

      this.get(normalizedBase, controller.index)
      this.get(`${normalizedBase}/new`, controller.new)
      this.post(normalizedBase, controller.store)
      this.get(`${normalizedBase}/:id`, controller.show)
      this.get(`${normalizedBase}/:id/edit`, controller.edit)
      this.put(`${normalizedBase}/:id`, controller.update)
      this.patch(`${normalizedBase}/:id`, controller.update)
      this.delete(`${normalizedBase}/:id`, controller.destroy)
    },

    /**
     * @param {string} url
     * @param {string} action
     */
    get(url, action) {
      return this.addRoute('get', url, action)
    },
    /**
     * @param {string} url
     * @param {string} action
     */
    post(url, action) {
      return this.addRoute('post', url, action)
    },
    /**
     * @param {string} url
     * @param {string} action
     */
    put(url, action) {
      return this.addRoute('put', url, action)
    },
    /**
     * @param {string} url
     * @param {string} action
     */
    delete(url, action) {
      return this.addRoute('delete', url, action)
    },
    routeForAction(action, params = {}) {
      const [controllerName, actionName] = action.split('.')
      const binding = controllerBindings.get(controllerName)

      if (!binding) {
        throw new ControllerBindingError(
          'Cannot find the controller with the name ${controllerName}',
          ControllerBindingError.NOT_FOUND
        )
      }

      for (let entry of [...routeBinding]) {
        if (
          entry[1].controllerName !== binding.name &&
          entry[1].controllerName !== binding.alias
        ) {
          continue
        }

        if (entry[1].actionName !== actionName) {
          continue
        }

        const url = entry[0]
        const fn = compile(url, { encode: encodeURIComponent })
        return fn({ ...params })
      }
    },
    listRoutes() {
      return [...routeBinding.entries()].map(x => ({
        url: x[0],
        ...x[1],
      }))
    },
  }
}
