import { Controller, HttpRequest, HttpResponse, AddAccount } from './signup-controller-protocols'
import { badRequest, serverError, ok } from '../../helper/http/http-helper'
import { Validation } from '../../protocols/validation'

export class SignUpController implements Controller {
  constructor (
    private readonly addAccount: AddAccount,
    private readonly validation: Validation
  ) { }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)

      if (error) {
        return badRequest(error)
      }

      const { email, name, password } = httpRequest.body

      const account = await this.addAccount.add({ email, name, password })

      return ok(account)
    } catch (error) {
      return serverError(error)
    }
  }
}
