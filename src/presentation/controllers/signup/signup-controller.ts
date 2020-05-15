import { Controller, HttpRequest, HttpResponse, AddAccount } from './signup-controller-protocols'
import { badRequest, serverError, ok } from '../../helper/http/http-helper'
import { Validation } from '../../protocols/validation'
import { Authentication } from '../login/login-controller-protocols'

export class SignUpController implements Controller {
  constructor (
    private readonly addAccount: AddAccount,
    private readonly validation: Validation,
    private readonly authentication: Authentication
  ) { }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)

      if (error) {
        return badRequest(error)
      }

      const { email, name, password } = httpRequest.body

      await this.addAccount.add({ email, name, password })

      const accessToken = await this.authentication.auth({ email, password })

      return ok({ accessToken })
    } catch (error) {
      return serverError(error)
    }
  }
}
