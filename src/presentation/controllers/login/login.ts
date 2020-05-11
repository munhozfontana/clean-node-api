import { Controller, HttpRequest, HttpResponse, Authentication } from './login-protocols'
import { badRequest, unauthorized, serverError, ok } from '../../helper/http/http-helper'
import { Validation } from '../signup/signup-protocols'

export class LoginController implements Controller {
  private readonly althentication: Authentication
  private readonly validation: Validation

  constructor (althentication: Authentication, validation: Validation) {
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
      const accessToken = await this.althentication.auth({ email, password })
      if (!accessToken) {
        return unauthorized()
      }
      return ok({ accessToken })
    } catch (error) {
      return serverError(error)
    }
  }
}
