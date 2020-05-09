import { LoginController } from './login'
import { HttpRequest } from '../../protocols'
import { badRequest } from '../../helper/http-helper'
import { MissingParamError } from '../../erros'

interface SutTypes {
  sut: LoginController
  fakeHttpRequest: HttpRequest
}

const makeSut = (): SutTypes => {
  const fakeHttpRequest = makeFakeHttpRequest()

  const sut = new LoginController()
  return {
    sut,
    fakeHttpRequest
  }
}

const makeFakeHttpRequest = (): HttpRequest => {
  return {
    body: {
      email: 'any_email@mail.com',
      password: 'any_password'
    }
  }
}

describe('Login Controller', () => {
  test('should return 400 if no eamil is provided', async () => {
    const { sut, fakeHttpRequest } = makeSut()

    const result = await sut.handle(fakeHttpRequest)

    expect(result).toEqual(badRequest(new MissingParamError('email')))
  })
})
