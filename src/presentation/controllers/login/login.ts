import { Controller, HttpRequest, HttpResponse, Althentication } from './login-protocols'
import { badRequest, unauthorized, serverError, ok } from '../../helper/http-helper'
import { Validation } from '../signup/signup-protocols'

export class LoginController implements Controller {
  private readonly althentication: Althentication
  private readonly validation: Validation

  constructor (althentication: Althentication, validation: Validation) {
    this.althentication = althentication
    this.validation = validation
  }

  async handle ({ body }: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(body)
      if (error) {
        return badRequest(error)
      }

      const { email, password } = body
      const accessToken = await this.althentication.auth(email, password)
      if (!accessToken) {
        return unauthorized()
      }
      return ok({ accessToken })
    } catch (error) {
      return serverError(error)
    }
  }
}
