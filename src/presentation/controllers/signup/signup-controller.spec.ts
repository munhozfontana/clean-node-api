
import { AddAccount, AddAccountModel, AccountModel, HttpRequest } from './signup-controller-protocols'
import { SignUpController } from './signup-controller'
import { MissingParamError, ServerError } from '../../erros'
import { ok, badRequest, serverError } from '../../helper/http/http-helper'
import { Validation } from '../../protocols/validation'

interface SutTypes {
  sut: SignUpController
  addAccountStub: AddAccount
  validationStub: Validation
  request: HttpRequest
  accountModel: AccountModel
  addAccountModel: AddAccountModel
}

const makeSut = (): SutTypes => {
  const addAccountStub = makeAddAccount()
  const request = makeHttpRequest()
  const accountModel = makeAccountModel()
  const addAccountModel = makeAddAccountModel()
  const validationStub = makeValidation()

  const sut = new SignUpController(addAccountStub, validationStub)
  return {
    sut,
    addAccountStub,
    validationStub,
    request,
    accountModel,
    addAccountModel
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
    validate (input: any): Error {
      return null
    }
  }
  return new ValidationStub()
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
    const { sut, addAccountStub, request } = makeSut()
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(() => { throw new Error() })

    const httpResponse = await sut.handle(request)

    expect(httpResponse).toEqual(serverError(new ServerError(null)))
  })

  test('Should call AddAccount with correct email', async () => {
    const { sut, addAccountStub, request, addAccountModel } = makeSut()
    const addSpy = jest.spyOn(addAccountStub, 'add')

    await sut.handle(request)

    expect(addSpy).toHaveBeenCalledWith(addAccountModel)
  })

  test('Should return 200 valid data is provided', async () => {
    const { sut, request, accountModel } = makeSut()

    const httpResponse = await sut.handle(request)

    expect(httpResponse).toEqual(ok(accountModel))
  })

  test('Should call Validation with correct value', async () => {
    const { sut, request, validationStub } = makeSut()
    const validateSpy = jest.spyOn(validationStub, 'validate')

    await sut.handle(request)

    expect(validateSpy).toHaveBeenCalledWith(request.body)
  })

  test('Should return 200 Validation returns an errors', async () => {
    const { sut, request, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('any_field'))

    const httpResponse = await sut.handle(request)

    expect(httpResponse).toEqual(badRequest(new MissingParamError('any_field')))
  })
})
