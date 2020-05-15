import { DbAddAccount } from './db-add-account'
import { Hasher } from './db-add-account-protocols'
import { AddAccountRepository } from '../../protocols/db/account/add-account-repositry'
import { AddAccountModel } from '../../../domain/usecases/add-account'
import { AccountModel } from '../../../domain/models/account'
import { LoadAccountByEmailRepository } from '../authentication/db-authentication-protocols'

interface SutTypes {
  sut: DbAddAccount
  hasherStub: Hasher
  addAccountRepositoryStub: AddAccountRepository
  accountModelStub: AccountModel
  addAccountModelStub: AddAccountModel
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
}

const makeSut = (): SutTypes => {
  const hasherStub = makeHasher()
  const addAccountRepositoryStub = makeAddAccountRepository()
  const accountModelStub = makeAccountModel()
  const addAccountModelStub = makeAddAccountModel()
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository()

  const sut = new DbAddAccount(hasherStub, addAccountRepositoryStub, loadAccountByEmailRepositoryStub)
  return {
    sut,
    hasherStub,
    addAccountRepositoryStub,
    accountModelStub,
    addAccountModelStub,
    loadAccountByEmailRepositoryStub
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
      return new Promise(resolve => resolve(makeAccountModel()))
    }
  }
  return new AddAccountRepositoryStub()
}

const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async loadAccountByEmail (_email: string): Promise<AccountModel> {
      return new Promise(resolve => resolve(makeAccountModel()))
    }
  }

  return new LoadAccountByEmailRepositoryStub()
}

const makeAccountModel = (): AccountModel => {
  return {
    id: 'any_id',
    name: 'any_name',
    email: 'valid_email@gmail.com',
    password: 'any_password'
  }
}

const makeAddAccountModel = (): AddAccountModel => {
  return {
    email: 'valid_email@gmail.com',
    name: 'any_name',
    password: 'any_password'
  }
}

describe('DbAddAccount Usecase', () => {
  test('Should call Hasher with correct password', async () => {
    const { hasherStub, sut, addAccountModelStub } = makeSut()
    const hashSpy = jest.spyOn(hasherStub, 'hash')

    await sut.add(addAccountModelStub)

    expect(hashSpy).toHaveBeenCalledWith('any_password')
  })

  test('Should throw if Hasher throws', async () => {
    const { hasherStub, sut, addAccountModelStub } = makeSut()
    jest.spyOn(hasherStub, 'hash').mockReturnValueOnce(new Promise((resolve, reject) => {
      reject(new Error())
    }))

    const promisse = sut.add(addAccountModelStub)

    await expect(promisse).rejects.toThrow()
  })

  test('Should call AddAccountRepository with correct password', async () => {
    const { sut, addAccountRepositoryStub, addAccountModelStub, accountModelStub } = makeSut()
    const addSpy = jest.spyOn(addAccountRepositoryStub, 'addAccount')
    delete accountModelStub.id
    accountModelStub.password = 'hashed_password'

    await sut.add(addAccountModelStub)

    expect(addSpy).toHaveBeenCalledWith(accountModelStub)
  })

  test('Should throw if addAccountRepository throws', async () => {
    const { addAccountRepositoryStub, sut, addAccountModelStub } = makeSut()
    jest.spyOn(addAccountRepositoryStub, 'addAccount').mockReturnValueOnce(new Promise((resolve, reject) => {
      reject(new Error())
    }))

    const promisse = sut.add(addAccountModelStub)

    await expect(promisse).rejects.toThrow()
  })

  test('Should return an account on success', async () => {
    const { sut, addAccountModelStub, accountModelStub } = makeSut()

    const account = await sut.add(addAccountModelStub)

    expect(account).toEqual(accountModelStub)
  })

  test('should call if LoadAccountByEmailRepository with correct email', async () => {
    const { sut, loadAccountByEmailRepositoryStub, addAccountModelStub } = makeSut()

    const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadAccountByEmail')

    await sut.add(addAccountModelStub)
    expect(loadSpy).toHaveBeenCalledWith('valid_email@gmail.com')
  })
})
