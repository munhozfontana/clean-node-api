import { HttpRequest, Althentication, EmailValidator } from './login-protocols'
import { badRequest, serverError, unauthorized, ok } from '../../helper/http-helper'
import { MissingParamError, InvalidParamError } from '../../erros'
import { LoginController } from './login'

interface SutTypes {
  sut: LoginController
  fakeHttpRequest: HttpRequest
  emailValidatorStub: EmailValidator
  althenticationStub: Althentication
}

const makeSut = (): SutTypes => {
  const fakeHttpRequest = makeFakeHttpRequest()
  const emailValidatorStub = makeEmailValidator()
  const althenticationStub = makeAlthentication()

  const sut = new LoginController(emailValidatorStub, althenticationStub)
  return {
    sut,
    fakeHttpRequest,
    emailValidatorStub,
    althenticationStub
  }
}

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (_email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}

const makeAlthentication = (): Althentication => {
  class AlthenticationStub implements Althentication {
    async auth (_email: string, _password: string): Promise<string> {
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

describe('Login Controller', () => {
  test('should return 400 if no email is provided', async () => {
    const { sut, fakeHttpRequest } = makeSut()
    delete fakeHttpRequest.body.email

    const result = await sut.handle(fakeHttpRequest)

    expect(result).toEqual(badRequest(new MissingParamError('email')))
  })

  test('should return 400 if no password is provided', async () => {
    const { sut, fakeHttpRequest } = makeSut()
    delete fakeHttpRequest.body.password

    const result = await sut.handle(fakeHttpRequest)

    expect(result).toEqual(badRequest(new MissingParamError('password')))
  })

  test('should return 400 if an email is provided', async () => {
    const { sut, fakeHttpRequest, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)

    const result = await sut.handle(fakeHttpRequest)

    expect(result).toEqual(badRequest(new InvalidParamError('email')))
  })

  test('should call EmailValidator with correct email', async () => {
    const { sut, fakeHttpRequest, emailValidatorStub } = makeSut()
    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')

    await sut.handle(fakeHttpRequest)

    expect(isValidSpy).toHaveBeenCalledWith(fakeHttpRequest.body.email)
  })

  test('should return 500 if EmailValidator throws', async () => {
    const { sut, fakeHttpRequest, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error()
    })

    const httpResponse = await sut.handle(fakeHttpRequest)

    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('should call Althentication with correct values', async () => {
    const { sut, fakeHttpRequest, althenticationStub } = makeSut()
    const authSpy = jest.spyOn(althenticationStub, 'auth')

    await sut.handle(fakeHttpRequest)

    expect(authSpy).toHaveBeenCalledWith(fakeHttpRequest.body.email, fakeHttpRequest.body.password)
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
})
