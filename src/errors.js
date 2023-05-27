export class RouterBindingError extends Error {
  _errorCode

  static INVALID_METHOD = 1
  static CONTROLLER_NOT_FOUND = 2
  static CONTROLLER_ACTION_NOT_FOUND = 3

  constructor(message, code) {
    super(message)
    this._message = message
    this._errorCode = code
  }

  toString() {
    return `${this._errorCode} - ${this._message}`
  }
}

export class ControllerBindingError extends Error {
  _errorCode

  static NO_NAME = 0
  static NAME_ALREADY_BOUND = 1

  constructor(message, code) {
    super(message)
    this._message = message
    this._errorCode = code
  }

  toString() {
    return `${this._errorCode} - ${this._message}`
  }
}
