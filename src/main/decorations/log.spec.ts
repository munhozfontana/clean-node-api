import { Controller, HttpRequest, HttpResponse } from '../../presentation/protocols'
import { LogControllerDecorator } from './log'

const makeControllerStub = (): Controller => {
  class ControllerStub implements Controller {
    async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
      const httpResponse: HttpResponse = {
        statusCode: 200,
        body: {
          email: 'any_email',
          name: 'any_name',
          password: 'any_password'
        }
      }

      return new Promise(resolve => resolve(httpResponse))
    }
  }
  return new ControllerStub()
}

describe('LogController Decorator', () => {
  test('should call controller haldle', async () => {
    const controllerStub = makeControllerStub()
    const haldleSpy = jest.spyOn(controllerStub, 'handle')
    const sut = new LogControllerDecorator(controllerStub)
    const httpRequest = {
      body: {
        email: 'any_email',
        name: 'any_name',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    await sut.handle(httpRequest)
    expect(haldleSpy).toHaveBeenCalledWith(httpRequest)
  })
})
