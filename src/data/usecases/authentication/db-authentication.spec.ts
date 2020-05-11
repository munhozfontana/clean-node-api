import { AccountModel } from '../../../domain/models/account'
import { LoadAccountByEmailRepository } from '../../protocols/db/load-account-by-email-repository'
import { DbAuthentication } from './db-authentication'
import { AuthenticationModel } from '../../../domain/usecases/althentication'
import { HashComparer } from '../../protocols/criptography/hash-comparer'
import { TokenGenerator } from '../../protocols/criptography/token-generator'

interface SutTypes {
  sut: DbAuthentication
  loadAccountByEmailRepository: LoadAccountByEmailRepository
  accountModel: AccountModel
  hashComparer: HashComparer
  authenticationModel: AuthenticationModel
  tokenGenerator: TokenGenerator

}

const makeSut = (): SutTypes => {
  const authenticationModel = makeAuthenticationModel()
  const loadAccountByEmailRepository = makeLoadAccountByEmailRepository()
  const accountModel = makeAccountModel()
  const hashComparer = makeHashComparer()
  const tokenGenerator = makeTokenGenerator()

  const sut = new DbAuthentication(
    loadAccountByEmailRepository,
    hashComparer,
    tokenGenerator
  )
  return {
    sut,
    loadAccountByEmailRepository,
    accountModel,
    hashComparer,
    authenticationModel,
    tokenGenerator
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

const makeHashComparer = (): HashComparer => {
  class HashComparerStub implements HashComparer {
    async compare (value: string, hash: string): Promise<boolean> {
      return new Promise(resolve => resolve(true))
    }
  }

  return new HashComparerStub()
}

const makeTokenGenerator = (): TokenGenerator => {
  class TokenGeneratorStub implements TokenGenerator {
    async generate (id: string): Promise<string> {
      return new Promise(resolve => resolve('valid_token'))
    }
  }

  return new TokenGeneratorStub()
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

  test('should return null if HashComparer returns false', async () => {
    const { sut, hashComparer } = makeSut()
    jest.spyOn(hashComparer, 'compare').mockResolvedValueOnce(false)
    const accessToken = await sut.auth(makeAuthenticationModel())
    expect(accessToken).toBeNull()
  })

  test('should call TokenGenerator with correct id', async () => {
    const { sut, tokenGenerator, accountModel, authenticationModel } = makeSut()
    const generateSpy = jest.spyOn(tokenGenerator, 'generate')
    await sut.auth(authenticationModel)
    expect(generateSpy).toHaveBeenCalledWith(accountModel.id)
  })

  test('should throw if TokenGenerator throws', async () => {
    const { sut, tokenGenerator } = makeSut()
    jest.spyOn(tokenGenerator, 'generate').mockRejectedValueOnce(new Error())
    const promise = sut.auth(makeAuthenticationModel())
    await expect(promise).rejects.toThrow()
  })

  test('should call TokenGenerator with correct id', async () => {
    const { sut, authenticationModel } = makeSut()
    const result = await sut.auth(authenticationModel)
    expect(result).toBe('valid_token')
  })
})
