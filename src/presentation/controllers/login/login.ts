import { Controller, HttpRequest, HttpResponse } from '../../protocols'
import { badRequest } from '../../helper/http-helper'
import { MissingParamError } from '../../erros'
import { EmailValidator } from '../signup/signup-protocols'

export class LoginController implements Controller {
  private readonly emailValidator: EmailValidator

  constructor (emailValidator: EmailValidator) {
    this.emailValidator = emailValidator
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    if (!httpRequest.body.email) {
      return await badRequest(new MissingParamError('email'))
    }
    if (!httpRequest.body.password) {
      return await badRequest(new MissingParamError('password'))
    }

    this.emailValidator.isValid(httpRequest.body.email)
  }
}
