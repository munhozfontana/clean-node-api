import { LoginController } from './login'
import { HttpRequest } from '../../protocols'
import { badRequest, serverError } from '../../helper/http-helper'
import { MissingParamError, InvalidParamError } from '../../erros'
import { EmailValidator } from '../signup/signup-protocols'

interface SutTypes {
  sut: LoginController
  fakeHttpRequest: HttpRequest
  emailValidatorStub: EmailValidator
}

const makeSut = (): SutTypes => {
  const fakeHttpRequest = makeFakeHttpRequest()
  const emailValidatorStub = makeEmailValidator()

  const sut = new LoginController(emailValidatorStub)
  return {
    sut,
    fakeHttpRequest,
    emailValidatorStub
  }
}

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
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
})
