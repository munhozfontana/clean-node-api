import { DbAddAccount } from './db-add-account'
import { Encrypter } from './db-add-account-protocols'
import { AddAccountRepository } from '../../protocols/db/add-account-repositry'
import { AddAccountModel } from '../../../domain/usecases/add-account'
import { AccountModel } from '../../../domain/models/account'

interface SutTypes {
  sut: DbAddAccount
  encryptStub: Encrypter
  addAccountRepositoryStub: AddAccountRepository
  fakeAccountModel: AccountModel
  fakeAddAccountModel: AddAccountModel
}

const makeSut = (): SutTypes => {
  const encryptStub = makeEncrypter()
  const addAccountRepositoryStub = makeAddAccountRepository()
  const fakeAccountModel = makeFakeAccountModel()
  const fakeAddAccountModel = makeFakeAddAccountModel()

  const sut = new DbAddAccount(encryptStub, addAccountRepositoryStub)
  return {
    sut,
    encryptStub,
    addAccountRepositoryStub,
    fakeAccountModel,
    fakeAddAccountModel
  }
}

const makeEncrypter = (): Encrypter => {
  class EncryptStub implements Encrypter {
    async encrypt (_value: string): Promise<string> {
      return new Promise(resolve => resolve('hashed_password'))
    }
  }
  return new EncryptStub()
}

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add (_accountData: AddAccountModel): Promise<AccountModel> {
      return new Promise(resolve => resolve(makeFakeAccountModel()))
    }
  }
  return new AddAccountRepositoryStub()
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

describe('DbAddAccount Usecase', () => {
  test('Should call Encrypter with correct password', async () => {
    const { encryptStub, sut, fakeAddAccountModel } = makeSut()
    const encryptSpy = jest.spyOn(encryptStub, 'encrypt')

    await sut.add(fakeAddAccountModel)

    expect(encryptSpy).toHaveBeenCalledWith('any_password')
  })

  test('Should throw if Encrypter throws', async () => {
    const { encryptStub, sut, fakeAddAccountModel } = makeSut()
    jest.spyOn(encryptStub, 'encrypt').mockReturnValueOnce(new Promise((resolve, reject) => {
      reject(new Error())
    }))

    const promisse = sut.add(fakeAddAccountModel)

    await expect(promisse).rejects.toThrow()
  })

  test('Should call AddAccountRepository with correct password', async () => {
    const { sut, addAccountRepositoryStub, fakeAddAccountModel, fakeAccountModel } = makeSut()
    const addSpy = jest.spyOn(addAccountRepositoryStub, 'add')
    delete fakeAccountModel.id
    fakeAccountModel.password = 'hashed_password'

    await sut.add(fakeAddAccountModel)

    expect(addSpy).toHaveBeenCalledWith(fakeAccountModel)
  })

  test('Should throw if addAccountRepository throws', async () => {
    const { addAccountRepositoryStub, sut, fakeAddAccountModel } = makeSut()
    jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValueOnce(new Promise((resolve, reject) => {
      reject(new Error())
    }))

    const promisse = sut.add(fakeAddAccountModel)

    await expect(promisse).rejects.toThrow()
  })

  test('Should return an account on success', async () => {
    const { sut, fakeAddAccountModel, fakeAccountModel } = makeSut()

    const account = await sut.add(fakeAddAccountModel)

    expect(account).toEqual(fakeAccountModel)
  })
})
