import { Controller, HttpRequest, HttpResponse } from '../../presentation/protocols'
import { LogErrorRepository } from '../../data/protocols/db/log/log-error-repositry'

export class LogControllerDecorator implements Controller {
  constructor (
    private readonly controller: Controller,
    private readonly logErrorRepository: LogErrorRepository
  ) { }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    const httpReponse = await this.controller.handle(httpRequest)
    if (httpReponse.statusCode === 500) {
      await this.logErrorRepository.logError(httpReponse.body.stack)
    }
    return httpReponse
  }
}
