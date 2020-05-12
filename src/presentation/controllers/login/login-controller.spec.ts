import { HttpRequest, Authentication, Validation } from './login-controller-protocols'
import { badRequest, serverError, unauthorized, ok } from '../../helper/http/http-helper'
import { MissingParamError } from '../../erros'
import { LoginController } from './login-controller'
import { AuthenticationModel } from '../../../domain/usecases/althentication'

interface SutTypes {
  sut: LoginController
  fakeHttpRequest: HttpRequest
  althenticationStub: Authentication
  validationStub: Validation
}

const makeSut = (): SutTypes => {
  const fakeHttpRequest = makeFakeHttpRequest()
  const althenticationStub = makeAlthentication()
  const validationStub = makeValidation()

  const sut = new LoginController(althenticationStub, validationStub)
  return {
    sut,
    fakeHttpRequest,
    althenticationStub,
    validationStub
  }
}

const makeAlthentication = (): Authentication => {
  class AlthenticationStub implements Authentication {
    async auth (authtentication: AuthenticationModel): Promise<string> {
      return new Promise(resolve => resolve('valid_token'))
    }
  }
  return new AlthenticationStub()
}

const makeFakeHttpRequest = (): HttpRequest => {
  return {
    body: {
      email: 'valid_email@mail.com',
      password: 'valid_password'
    }
  }
}

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate (input: any): Error {
      return null
    }
  }
  return new ValidationStub()
}

describe('Login Controller', () => {
  test('should call Althentication with correct values', async () => {
    const { sut, fakeHttpRequest, althenticationStub } = makeSut()
    const authSpy = jest.spyOn(althenticationStub, 'auth')

    await sut.handle(fakeHttpRequest)

    expect(authSpy).toHaveBeenCalledWith({
      email: fakeHttpRequest.body.email,
      password: fakeHttpRequest.body.password
    })
  })

  test('should return 401 if invalid credentials are provided', async () => {
    const { sut, fakeHttpRequest, althenticationStub } = makeSut()
    jest.spyOn(althenticationStub, 'auth').mockReturnValueOnce(
      new Promise(resolve => resolve(null))
    )

    const httpResponse = await sut.handle(fakeHttpRequest)

    expect(httpResponse).toEqual(unauthorized())
  })

  test('should return 500 if Althentication throws', async () => {
    const { sut, fakeHttpRequest, althenticationStub } = makeSut()
    jest.spyOn(althenticationStub, 'auth').mockRejectedValueOnce(() => {
      throw new Error()
    })

    const httpResponse = await sut.handle(fakeHttpRequest)

    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('should return 200 if valid credentials are provided', async () => {
    const { sut, fakeHttpRequest } = makeSut()

    const httpResponse = await sut.handle(fakeHttpRequest)

    expect(httpResponse).toEqual(ok({ accessToken: 'valid_token' }))
  })

  test('Should call Validation with correct value', async () => {
    const { sut, fakeHttpRequest, validationStub } = makeSut()
    const validateSpy = jest.spyOn(validationStub, 'validate')

    await sut.handle(fakeHttpRequest)

    expect(validateSpy).toHaveBeenCalledWith(fakeHttpRequest.body)
  })

  test('Should return 200 Validation returns an errors', async () => {
    const { sut, fakeHttpRequest, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('any_field'))

    const httpResponse = await sut.handle(fakeHttpRequest)

    expect(httpResponse).toEqual(badRequest(new MissingParamError('any_field')))
  })
})
