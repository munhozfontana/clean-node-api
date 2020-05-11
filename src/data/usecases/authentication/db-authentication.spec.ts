import { AccountModel } from '../../../domain/models/account'
import { LoadAccountByEmailRepository } from '../../protocols/db/load-account-by-email-repository'
import { DbAuthentication } from './db-authentication'
import { AuthenticationModel } from '../../../domain/usecases/althentication'
import { HashComparer } from '../../protocols/criptography/hash-comparer'

interface SutTypes {
  sut: DbAuthentication
  loadAccountByEmailRepository: LoadAccountByEmailRepository
  accountModel: AccountModel
  hashComparer: HashComparer
  authenticationModel: AuthenticationModel

}

const makeSut = (): SutTypes => {
  const authenticationModel = makeAuthenticationModel()
  const loadAccountByEmailRepository = makeLoadAccountByEmailRepository()
  const accountModel = makeAccountModel()
  const hashComparer = makeHashComparerStub()

  const sut = new DbAuthentication(loadAccountByEmailRepository, hashComparer)
  return {
    sut,
    loadAccountByEmailRepository,
    accountModel,
    hashComparer,
    authenticationModel
  }
}

const makeAccountModel = (): AccountModel => {
  return {
    id: 'valid_id',
    name: 'valid_name',
    email: 'valid_email@mail.com',
    password: 'valid_hashed_password'
  }
}

const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async load (email: string): Promise<AccountModel> {
      return new Promise(resolve => resolve(makeAccountModel()))
    }
  }

  return new LoadAccountByEmailRepositoryStub()
}

const makeAuthenticationModel = (): AuthenticationModel => {
  return { email: 'valid_email@gmail.com', password: 'valid_password' }
}

const makeHashComparerStub = (): HashComparer => {
  class HashComparerStub implements HashComparer {
    async compare (value: string, hash: string): Promise<boolean> {
      return new Promise(resolve => resolve(true))
    }
  }

  return new HashComparerStub()
}

describe('DbAuthentication UseCase', () => {
  test('should call if LoadAccountByEmailRepository with correct email', async () => {
    const { sut, loadAccountByEmailRepository } = makeSut()
    const loadSpy = jest.spyOn(loadAccountByEmailRepository, 'load')
    await sut.auth(makeAuthenticationModel())
    expect(loadSpy).toHaveBeenCalledWith('valid_email@gmail.com')
  })

  test('should throw if LoadAccountByEmailRepository throws', async () => {
    const { sut, loadAccountByEmailRepository } = makeSut()
    jest.spyOn(loadAccountByEmailRepository, 'load').mockRejectedValueOnce(new Error())
    const promise = sut.auth(makeAuthenticationModel())
    await expect(promise).rejects.toThrow()
  })

  test('should return null if LoadAccountByEmailRepository returns null', async () => {
    const { sut, loadAccountByEmailRepository } = makeSut()
    jest.spyOn(loadAccountByEmailRepository, 'load').mockReturnValueOnce(null)
    const accessToken = await sut.auth(makeAuthenticationModel())
    expect(accessToken).toBeNull()
  })

  test('should call HashComparer with correct values', async () => {
    const { sut, hashComparer, accountModel, authenticationModel } = makeSut()
    const compareSpy = jest.spyOn(hashComparer, 'compare').mockReturnValueOnce(null)
    await sut.auth(authenticationModel)
    expect(compareSpy).toHaveBeenCalledWith(authenticationModel.password, accountModel.password)
  })

  test('should throw if HashComparer throws', async () => {
    const { sut, hashComparer } = makeSut()
    jest.spyOn(hashComparer, 'compare').mockRejectedValueOnce(new Error())
    const promise = sut.auth(makeAuthenticationModel())
    await expect(promise).rejects.toThrow()
  })
})
