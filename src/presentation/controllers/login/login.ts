import { Controller, HttpRequest, HttpResponse } from '../../protocols'
import { badRequest } from '../../helper/http-helper'
import { MissingParamError, InvalidParamError } from '../../erros'
import { EmailValidator } from '../signup/signup-protocols'

export class LoginController implements Controller {
  private readonly emailValidator: EmailValidator

  constructor (emailValidator: EmailValidator) {
    this.emailValidator = emailValidator
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    const { email, password } = httpRequest.body
    if (!email) {
      return await badRequest(new MissingParamError('email'))
    }
    if (!password) {
      return await badRequest(new MissingParamError('password'))
    }

    const isValid = this.emailValidator.isValid(email)
    if (!isValid) {
      return await badRequest(new InvalidParamError('email'))
    }
  }
}
