
import { AddAccount, AddAccountModel, AccountModel, HttpRequest } from './signup-controller-protocols'
import { SignUpController } from './signup-controller'
import { MissingParamError, ServerError } from '../../erros'
import { ok, badRequest, serverError } from '../../helper/http/http-helper'
import { Validation } from '../../protocols/validation'
import { Authentication, AuthenticationModel } from '../login/login-controller-protocols'

interface SutTypes {
  sut: SignUpController
  addAccountStub: AddAccount
  validationStub: Validation
  httpRequestStub: HttpRequest
  accountModelStub: AccountModel
  addAccountModelStub: AddAccountModel
  authenticationStub: Authentication
}

const makeSut = (): SutTypes => {
  const addAccountStub = makeAddAccount()
  const httpRequestStub = makeHttpRequest()
  const accountModelStub = makeAccountModel()
  const addAccountModelStub = makeAddAccountModel()
  const validationStub = makeValidation()
  const authenticationStub = makeAlthentication()

  const sut = new SignUpController(addAccountStub, validationStub, authenticationStub)
  return {
    sut,
    addAccountStub,
    validationStub,
    httpRequestStub,
    accountModelStub,
    addAccountModelStub,
    authenticationStub
  }
}

const makeAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    async add (_account: AddAccountModel): Promise<AccountModel> {
      return new Promise(resolve => resolve(makeAccountModel()))
    }
  }
  return new AddAccountStub()
}

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate (_input: any): Error {
      return null
    }
  }
  return new ValidationStub()
}

const makeAlthentication = (): Authentication => {
  class AlthenticationStub implements Authentication {
    async auth (_authtentication: AuthenticationModel): Promise<string> {
      return new Promise(resolve => resolve('valid_token'))
    }
  }
  return new AlthenticationStub()
}

const makeHttpRequest = (): HttpRequest => {
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

const makeAccountModel = (): AccountModel => {
  return {
    id: 'any_id',
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password'
  }
}

const makeAddAccountModel = (): AddAccountModel => {
  return {
    email: 'any_email@mail.com',
    name: 'any_name',
    password: 'any_password'
  }
}

describe('SingUp Controller', () => {
  test('Should return 500 if AddAccount throws ', async () => {
    const { sut, addAccountStub, httpRequestStub } = makeSut()
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(() => { throw new Error() })

    const httpResponse = await sut.handle(httpRequestStub)

    expect(httpResponse).toEqual(serverError(new ServerError(null)))
  })

  test('Should call AddAccount with correct email', async () => {
    const { sut, addAccountStub, httpRequestStub, addAccountModelStub } = makeSut()
    const addSpy = jest.spyOn(addAccountStub, 'add')

    await sut.handle(httpRequestStub)

    expect(addSpy).toHaveBeenCalledWith(addAccountModelStub)
  })

  test('Should return 200 valid data is provided', async () => {
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

  test('should call Althentication with correct values', async () => {
    const { sut, httpRequestStub, authenticationStub } = makeSut()
    const authSpy = jest.spyOn(authenticationStub, 'auth')

    await sut.handle(httpRequestStub)

    expect(authSpy).toHaveBeenCalledWith({
      email: httpRequestStub.body.email,
      password: httpRequestStub.body.password
    })
  })

  test('should return 500 if Althentication throws', async () => {
    const { sut, httpRequestStub, authenticationStub } = makeSut()
    jest.spyOn(authenticationStub, 'auth').mockRejectedValueOnce(() => {
      throw new Error()
    })

    const httpResponse = await sut.handle(httpRequestStub)

    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
