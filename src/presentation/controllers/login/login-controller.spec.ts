import { HttpRequest, Authentication, Validation } from './login-controller-protocols'
import { badRequest, serverError, unauthorized, ok } from '../../helper/http/http-helper'
import { MissingParamError } from '../../erros'
import { LoginController } from './login-controller'
import { AuthenticationModel } from '../../../domain/usecases/althentication'

interface SutTypes {
  sut: LoginController
  httpRequestStub: HttpRequest
  authenticationStub: Authentication
  validationStub: Validation
}

const makeSut = (): SutTypes => {
  const httpRequestStub = makehttpRequest()
  const authenticationStub = makeAlthentication()
  const validationStub = makeValidation()

  const sut = new LoginController(authenticationStub, validationStub)
  return {
    sut,
    httpRequestStub,
    authenticationStub,
    validationStub
  }
}

const makeAlthentication = (): Authentication => {
  class AuthenticationStub implements Authentication {
    async auth (_authtentication: AuthenticationModel): Promise<string> {
      return new Promise(resolve => resolve('valid_token'))
    }
  }
  return new AuthenticationStub()
}

const makehttpRequest = (): HttpRequest => {
  return {
    body: {
      email: 'valid_email@mail.com',
      password: 'valid_password'
    }
  }
}

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate (_input: any): Error {
      return null
    }
  }
  return new ValidationStub()
}

describe('Login Controller', () => {
  test('should call Authentication with correct values', async () => {
    const { sut, httpRequestStub, authenticationStub } = makeSut()
    const authSpy = jest.spyOn(authenticationStub, 'auth')

    await sut.handle(httpRequestStub)

    expect(authSpy).toHaveBeenCalledWith({
      email: httpRequestStub.body.email,
      password: httpRequestStub.body.password
    })
  })

  test('should return 401 if invalid credentials are provided', async () => {
    const { sut, httpRequestStub, authenticationStub } = makeSut()
    jest.spyOn(authenticationStub, 'auth').mockReturnValueOnce(
      new Promise(resolve => resolve(null))
    )

    const httpResponse = await sut.handle(httpRequestStub)

    expect(httpResponse).toEqual(unauthorized())
  })

  test('should return 500 if Althentication throws', async () => {
    const { sut, httpRequestStub, authenticationStub } = makeSut()
    jest.spyOn(authenticationStub, 'auth').mockRejectedValueOnce(() => {
      throw new Error()
    })

    const httpResponse = await sut.handle(httpRequestStub)

    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('should return 200 if valid credentials are provided', async () => {
    const { sut, httpRequestStub } = makeSut()

    const httpResponse = await sut.handle(httpRequestStub)

    expect(httpResponse).toEqual(ok({ accessToken: 'valid_token' }))
  })

  test('Should call Validation with correct value', async () => {
    const { sut, httpRequestStub, validationStub } = makeSut()
    const validateSpy = jest.spyOn(validationStub, 'validate')

    await sut.handle(httpRequestStub)

    expect(validateSpy).toHaveBeenCalledWith(httpRequestStub.body)
  })

  test('Should return 200 Validation returns an errors', async () => {
    const { sut, httpRequestStub, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('any_field'))

    const httpResponse = await sut.handle(httpRequestStub)

    expect(httpResponse).toEqual(badRequest(new MissingParamError('any_field')))
  })
})
