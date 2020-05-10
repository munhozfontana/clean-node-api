import { Controller, HttpRequest, HttpResponse } from '../../protocols'
import { badRequest, serverError } from '../../helper/http-helper'
import { MissingParamError, InvalidParamError } from '../../erros'
import { EmailValidator } from '../signup/signup-protocols'

export class LoginController implements Controller {
  private readonly emailValidator: EmailValidator
  private readonly althentication: Althentication

  constructor (emailValidator: EmailValidator, althentication: Althentication) {
    this.emailValidator = emailValidator
    this.althentication = althentication
  }

  async handle ({ body }: HttpRequest): Promise<HttpResponse> {
    try {
      const requiredFileds = ['email', 'password']

      for (const field of requiredFileds) {
        if (!body[field]) {
          return await badRequest(new MissingParamError(field))
        }
      }

      const isValid = this.emailValidator.isValid(body.email)
      if (!isValid) {
        return await badRequest(new InvalidParamError('email'))
      }

      await this.althentication.auth(body.email, body.password)
    } catch (error) {
      return serverError(error)
    }
  }
}
