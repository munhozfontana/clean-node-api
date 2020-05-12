import { DbAddAccount } from './db-add-account'
import { Hasher } from './db-add-account-protocols'
import { AddAccountRepository } from '../../protocols/db/account/add-account-repositry'
import { AddAccountModel } from '../../../domain/usecases/add-account'
import { AccountModel } from '../../../domain/models/account'

interface SutTypes {
  sut: DbAddAccount
  hasherStub: Hasher
  addAccountRepositoryStub: AddAccountRepository
  fakeAccountModel: AccountModel
  fakeAddAccountModel: AddAccountModel
}

const makeSut = (): SutTypes => {
  const hasherStub = makeHasher()
  const addAccountRepositoryStub = makeAddAccountRepository()
  const fakeAccountModel = makeFakeAccountModel()
  const fakeAddAccountModel = makeFakeAddAccountModel()

  const sut = new DbAddAccount(hasherStub, addAccountRepositoryStub)
  return {
    sut,
    hasherStub,
    addAccountRepositoryStub,
    fakeAccountModel,
    fakeAddAccountModel
  }
}

const makeHasher = (): Hasher => {
  class HasherStub implements Hasher {
    async hash (_value: string): Promise<string> {
      return new Promise(resolve => resolve('hashed_password'))
    }
  }
  return new HasherStub()
}

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async addAccount (_accountData: AddAccountModel): Promise<AccountModel> {
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
  test('Should call Hasher with correct password', async () => {
    const { hasherStub, sut, fakeAddAccountModel } = makeSut()
    const hashSpy = jest.spyOn(hasherStub, 'hash')

    await sut.add(fakeAddAccountModel)

    expect(hashSpy).toHaveBeenCalledWith('any_password')
  })

  test('Should throw if Hasher throws', async () => {
    const { hasherStub, sut, fakeAddAccountModel } = makeSut()
    jest.spyOn(hasherStub, 'hash').mockReturnValueOnce(new Promise((resolve, reject) => {
      reject(new Error())
    }))

    const promisse = sut.add(fakeAddAccountModel)

    await expect(promisse).rejects.toThrow()
  })

  test('Should call AddAccountRepository with correct password', async () => {
    const { sut, addAccountRepositoryStub, fakeAddAccountModel, fakeAccountModel } = makeSut()
    const addSpy = jest.spyOn(addAccountRepositoryStub, 'addAccount')
    delete fakeAccountModel.id
    fakeAccountModel.password = 'hashed_password'

    await sut.add(fakeAddAccountModel)

    expect(addSpy).toHaveBeenCalledWith(fakeAccountModel)
  })

  test('Should throw if addAccountRepository throws', async () => {
    const { addAccountRepositoryStub, sut, fakeAddAccountModel } = makeSut()
    jest.spyOn(addAccountRepositoryStub, 'addAccount').mockReturnValueOnce(new Promise((resolve, reject) => {
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
