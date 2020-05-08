import { Controller, HttpRequest, HttpResponse } from '../../presentation/protocols'
import { LogControllerDecorator } from './log'

import { serverError, ok } from '../../presentation/helper/http-helper'
import { LogErrorRepository } from '../../data/protocols/log-error-repositry'

interface SutTypes {
  sut: LogControllerDecorator
  controllerStub: Controller
  logErrorRepositoryStub: LogErrorRepository
  fakeHttpRequest: HttpRequest
}

const makeSut = (): SutTypes => {
  const controllerStub = makeController()
  const logErrorRepositoryStub = makeLogErrorRepository()
  const fakeHttpRequest = makeFakeHttpRequest()

  const sut = new LogControllerDecorator(controllerStub, logErrorRepositoryStub)
  return {
    sut,
    controllerStub,
    logErrorRepositoryStub,
    fakeHttpRequest
  }
}

const makeLogErrorRepository = (): LogErrorRepository => {
  class LogErrorRepositoryStub implements LogErrorRepository {
    async log (_stack: string): Promise<void> {
      return new Promise(resolve => resolve())
    }
  }
  return new LogErrorRepositoryStub()
}

const makeController = (): Controller => {
  class ControllerStub implements Controller {
    async handle (_httpRequest: HttpRequest): Promise<HttpResponse> {
      return new Promise(resolve => resolve(ok(makeFakeHttpResponse())))
    }
  }
  return new ControllerStub()
}

const makeFakeHttpRequest = (): HttpRequest => {
  return {
    body: {
      id: 'any_id',
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password',
      passwordConfirmation: 'any_password'
    }
  }
}
const makeFakeHttpResponse = (): HttpResponse => ({
  statusCode: 200,
  body: {
    email: 'any_email',
    name: 'any_name',
    password: 'any_password'
  }
})

const makeFakeServerError = (): HttpResponse => {
  const fakeError = new Error()
  fakeError.stack = 'any_stack'
  return serverError(fakeError)
}

describe('LogController Decorator', () => {
  test('should call controller haldle', async () => {
    const { controllerStub, sut, fakeHttpRequest } = makeSut()
    const haldleSpy = jest.spyOn(controllerStub, 'handle')

    await sut.handle(fakeHttpRequest)

    expect(haldleSpy).toHaveBeenCalledWith(fakeHttpRequest)
  })

  test('should return the some result of the controller', async () => {
    const { sut, fakeHttpRequest } = makeSut()

    const result = await sut.handle(fakeHttpRequest)

    expect(result).toEqual(ok(makeFakeHttpResponse()))
  })

  test('should call LogErrorRepository with correct error if controller returns a server errror', async () => {
    const { sut, controllerStub, logErrorRepositoryStub, fakeHttpRequest } = makeSut()
    jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(new Promise(resolve => resolve(makeFakeServerError())))
    const logSpy = jest.spyOn(logErrorRepositoryStub, 'log')

    await sut.handle(fakeHttpRequest)

    expect(logSpy).toHaveBeenCalledWith('any_stack')
  })
})
