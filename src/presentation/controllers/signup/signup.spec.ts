
import { EmailValidator, AddAccount, AddAccountModel, AccountModel, HttpRequest } from './signup-protocols'
import { SignUpController } from './signup'
import { MissingParamError, InvalidParamError, ServerError } from '../../erros'
import { ok, badRequest, serverError } from '../../helper/http-helper'
import { Validation } from '../../helper/validators/validation'

interface SutTypes {
  sut: SignUpController
  emailValidatorStub: EmailValidator
  addAccountStub: AddAccount
  validationStub: Validation
  fakeRequest: HttpRequest
  fakeAccountModel: AccountModel
  fakeAddAccountModel: AddAccountModel
}

const makeSut = (): SutTypes => {
  const addAccountStub = makeAddAccount()
  const emailValidatorStub = makeEmailValidator()
  const fakeRequest = makeFakeHttpRequest()
  const fakeAccountModel = makeFakeAccountModel()
  const fakeAddAccountModel = makeFakeAddAccountModel()
  const validationStub = makeValidation()

  const sut = new SignUpController(emailValidatorStub, addAccountStub, validationStub)
  return {
    sut,
    emailValidatorStub,
    addAccountStub,
    validationStub,
    fakeRequest,
    fakeAccountModel,
    fakeAddAccountModel
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
  test('Should return 400 if no name is provided', async () => {
    const { sut, fakeRequest } = makeSut()
    delete fakeRequest.body.name

    const httpResponse = await sut.handle(fakeRequest)

    expect(httpResponse).toEqual(badRequest(new MissingParamError('name')))
  })

  test('Should return 400 if no email is provided', async () => {
    const { sut, fakeRequest } = makeSut()
    delete fakeRequest.body.email

    const httpResponse = await sut.handle(fakeRequest)

    expect(httpResponse).toEqual(badRequest(new MissingParamError('email')))
  })

  test('Should return 400 if no password is provided', async () => {
    const { sut, fakeRequest } = makeSut()
    delete fakeRequest.body.password

    const httpResponse = await sut.handle(fakeRequest)

    expect(httpResponse).toEqual(badRequest(new MissingParamError('password')))
  })

  test('Should return 400 if no password confirmation is provided', async () => {
    const { sut, fakeRequest } = makeSut()
    delete fakeRequest.body.passwordConfirmation

    const httpResponse = await sut.handle(fakeRequest)

    expect(httpResponse).toEqual(badRequest(new MissingParamError('passwordConfirmation')))
  })

  test('Should return 400 password confirmation fails', async () => {
    const { sut, fakeRequest } = makeSut()
    fakeRequest.body.password = 'invalid_password'

    const httpResponse = await sut.handle(fakeRequest)

    expect(httpResponse).toEqual(badRequest(new InvalidParamError('passwordConfirmation')))
  })

  test('Should return 400 if invalid email is provided', async () => {
    const { sut, emailValidatorStub, fakeRequest } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)

    const httpResponse = await sut.handle(fakeRequest)

    expect(httpResponse).toEqual(badRequest(new InvalidParamError('email')))
  })

  test('Should call EmailValidator with correct email', async () => {
    const { sut, emailValidatorStub, fakeRequest } = makeSut()
    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')

    await sut.handle(fakeRequest)

    expect(isValidSpy).toHaveBeenCalledWith('any_email@mail.com')
  })

  test('Should return 500 if EmailValidator throws ', async () => {
    const { sut, emailValidatorStub, fakeRequest } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => { throw new Error() })

    const httpResponse = await sut.handle(fakeRequest)

    expect(httpResponse).toEqual(serverError(new ServerError(null)))
  })

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
})
