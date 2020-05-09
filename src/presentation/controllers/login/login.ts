import { Controller, HttpRequest, HttpResponse } from '../../protocols'
import { badRequest } from '../../helper/http-helper'
import { MissingParamError } from '../../erros'

export class LoginController implements Controller {
  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    if (!httpRequest.body.email) {
      return await badRequest(new MissingParamError('email'))
    }
    if (!httpRequest.body.password) {
      return await badRequest(new MissingParamError('password'))
    }
  }
}
