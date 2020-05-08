import { Controller, HttpRequest, HttpResponse } from '../../presentation/protocols'
import { LogErrorRepository } from '../../data/protocols/log-error-repositry'

export class LogControllerDecorator implements Controller {
  private readonly controller: Controller
  private readonly logErrorRepository: LogErrorRepository
  constructor (controller: Controller, logErrorRepository: LogErrorRepository) {
    this.controller = controller
    this.logErrorRepository = logErrorRepository
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    const httpReponse = await this.controller.handle(httpRequest)
    if (httpReponse.statusCode === 500) {
      await this.logErrorRepository.log(httpReponse.body.stack)
    }
    return httpReponse
  }
}
