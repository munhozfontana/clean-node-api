
import { AddAccount, AddAccountModel, AccountModel, HttpRequest } from './signup-protocols'
import { SignUpController } from './signup'
import { MissingParamError, ServerError } from '../../erros'
import { ok, badRequest, serverError } from '../../helper/http/http-helper'
import { Validation } from '../../protocols/validation'

interface SutTypes {
  sut: SignUpController
  addAccountStub: AddAccount
  validationStub: Validation
  fakeRequest: HttpRequest
  fakeAccountModel: AccountModel
  fakeAddAccountModel: AddAccountModel
}

const makeSut = (): SutTypes => {
  const addAccountStub = makeAddAccount()
  const fakeRequest = makeFakeHttpRequest()
  const fakeAccountModel = makeFakeAccountModel()
  const fakeAddAccountModel = makeFakeAddAccountModel()
  const validationStub = makeValidation()

  const sut = new SignUpController(addAccountStub, validationStub)
  return {
    sut,
    addAccountStub,
    validationStub,
    fakeRequest,
    fakeAccountModel,
    fakeAddAccountModel
  }
}

const makeAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    async add (_account: AddAccountModel): Promise<AccountModel> {
      return new Promise(resolve => resolve(makeFakeAccountModel()))
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

const makeFakeAccountModel = (): AccountModel => {
  return {
    id: 'any_id',
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password'
  }
}

const makeFakeAddAccountModel = (): AddAccountModel => {
  return {
    email: 'any_email@mail.com',
    name: 'any_name',
    password: 'any_password'
  }
}

describe('SingUp Controller', () => {
  test('Should return 500 if AddAccount throws ', async () => {
    const { sut, addAccountStub, fakeRequest } = makeSut()
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(() => { throw new Error() })

    const httpResponse = await sut.handle(fakeRequest)

    expect(httpResponse).toEqual(serverError(new ServerError(null)))
  })

  test('Should call AddAccount with correct email', async () => {
    const { sut, addAccountStub, fakeRequest, fakeAddAccountModel } = makeSut()
    const addSpy = jest.spyOn(addAccountStub, 'add')

    await sut.handle(fakeRequest)

    expect(addSpy).toHaveBeenCalledWith(fakeAddAccountModel)
  })

  test('Should return 200 valid data is provided', async () => {
    const { sut, fakeRequest, fakeAccountModel } = makeSut()

    const httpResponse = await sut.handle(fakeRequest)

    expect(httpResponse).toEqual(ok(fakeAccountModel))
  })

  test('Should call Validation with correct value', async () => {
    const { sut, fakeRequest, validationStub } = makeSut()
    const validateSpy = jest.spyOn(validationStub, 'validate')

    await sut.handle(fakeRequest)

    expect(validateSpy).toHaveBeenCalledWith(fakeRequest.body)
  })

  test('Should return 200 Validation returns an errors', async () => {
    const { sut, fakeRequest, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('any_field'))

    const httpResponse = await sut.handle(fakeRequest)

    expect(httpResponse).toEqual(badRequest(new MissingParamError('any_field')))
  })
})
