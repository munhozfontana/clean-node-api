import { LoginController } from './login'
import { HttpRequest } from '../../protocols'
import { badRequest } from '../../helper/http-helper'
import { MissingParamError, InvalidParamError } from '../../erros'
import { EmailValidator } from '../signup/signup-protocols'

interface SutTypes {
  sut: LoginController
  fakeHttpRequest: HttpRequest
  emailValidator: EmailValidator
}

const makeSut = (): SutTypes => {
  const fakeHttpRequest = makeFakeHttpRequest()
  const emailValidator = makeEmailValidator()

  const sut = new LoginController(emailValidator)
  return {
    sut,
    fakeHttpRequest,
    emailValidator
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
    const { sut, fakeHttpRequest, emailValidator } = makeSut()
    jest.spyOn(emailValidator, 'isValid').mockReturnValueOnce(false)

    const result = await sut.handle(fakeHttpRequest)

    expect(result).toEqual(badRequest(new InvalidParamError('email')))
  })

  test('should call EmailValidator with correct email', async () => {
    const { sut, fakeHttpRequest, emailValidator } = makeSut()
    const isValidSpy = jest.spyOn(emailValidator, 'isValid')

    await sut.handle(fakeHttpRequest)

    expect(isValidSpy).toHaveBeenCalledWith(fakeHttpRequest.body.email)
  })
})
